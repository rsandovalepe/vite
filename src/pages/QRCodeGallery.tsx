import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadItemDelete,
  FileUploadList,
  FileUploadTrigger,
} from '@/components/ui/file-upload';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Gallery, type Image as GalleryImage } from 'react-grid-gallery';
import Lightbox from 'yet-another-react-lightbox';
import type { DownloadFunctionProps } from 'yet-another-react-lightbox';
import Download from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';
import { fetchWithAuth } from '@/lib/api';
import { ArrowDown, Info, X } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

type SortBy = 'createdAt' | 'exifCreatedAt';

const fetchedDescriptions = new Set<string>();
const tokensInitialized = new Set<string>();
const lastSortBy = new Map<string, SortBy>();

interface QRCodeItem {
  id: number;
  uuid: string;
  fileName: string;
  createdAt: string;
  exifCreatedAt: string | null;
}

interface GalleryItem extends GalleryImage {
  original: string;
  createdAt: string;
  exifCreatedAt: string | null;
}

function QRCodeGalleryPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [infoOpen, setInfoOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const galleryRef = useRef<HTMLDivElement>(null);
  const scrollToGallery = useCallback(() => {
    console.log("test");
    // galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  const randomImage = useMemo(() => {
    if (images.length === 0) return null;
    return images[Math.floor(Math.random() * images.length)];
  }, [images]);
  const currentImage = lightboxIndex >= 0 ? images[lightboxIndex] : null;

  function formatInfo(dateString: string | null, prefix: string) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const title = isToday
      ? `${prefix} today`
      : date.getFullYear() === now.getFullYear()
        ? `${prefix} ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
        : `${prefix} ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    const subtitle = `${date.toLocaleDateString(undefined, { weekday: 'long' })} ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    return { title, subtitle };
  }

  const addedInfo = formatInfo(currentImage?.createdAt ?? null, 'Added');
  const capturedInfo = formatInfo(currentImage?.exifCreatedAt ?? null, 'Captured');

  const handleDownloadClick = useCallback(
    async ({ slide, saveAs }: DownloadFunctionProps) => {
    const url =
      (typeof slide.download === 'string' && slide.download) ||
      (typeof slide.download === 'object' && slide.download.url) ||
      slide.downloadUrl ||
      (slide as { src?: string }).src ||
      '';
    const filename =
      (typeof slide.download === 'object' && slide.download.filename) ||
      slide.downloadFilename ||
      'download';
      const hasMSStream = 'MSStream' in window;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !hasMSStream;
      if (isIOS && 'share' in navigator) {
        navigator.share({ url }).catch(() => saveAs(url, filename));
      } else if ('showSaveFilePicker' in window) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const handle = await (
            window as unknown as {
              showSaveFilePicker: (options: { suggestedName: string }) => Promise<FileSystemFileHandle>;
            }
          ).showSaveFilePicker({
            suggestedName: filename,
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch {
            saveAs(url, filename);
        }
      } else {
        saveAs(url, filename);
      }
    },
    [],
  );
  const handleUpload = useCallback(
    async (
      files: File[],
      {
        onProgress,
        onSuccess,
        onError,
      }: {
        onProgress: (file: File, progress: number) => void;
        onSuccess: (file: File) => void;
        onError: (file: File, error: Error) => void;
      },
    ) => {
      const token = localStorage.getItem('token');
      for (const file of files) {
        await new Promise<void>((resolve) => {
          const formData = new FormData();
          formData.append('file', file);
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `http://localhost:8080/photos/${uuid}/`);
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              onProgress(file, progress);
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              onSuccess(file);
            } else if (xhr.status === 401 || xhr.status === 403) {
              onError(file, new Error('Unauthorized'));
            } else {
              onError(file, new Error(`Upload failed with status ${xhr.status}`));
            }
            resolve();
          };
          xhr.onerror = () => {
            onError(file, new Error('Upload failed'));
            resolve();
          };
          xhr.send(formData);
        });
      }
    },
    [uuid],
  );

  const loadMore = useCallback(
    async (reset = false) => {
      if (loading || (!hasMore && !reset) || !uuid) return;
      const nextPage = reset ? 0 : page;
      if (reset) {
        setImages([]);
        setHasMore(true);
      }
      setLoading(true);
      const params = new URLSearchParams({
        page: String(nextPage),
        size: '30',
        sortBy,
      });
      const itemsRes = await fetchWithAuth(
        `http://localhost:8080/qrcode-items/qr/uuid/${uuid}?${params.toString()}`,
      );
      const data = await itemsRes.json();
      const items = data.content as QRCodeItem[];
      const tokenRequests = items.flatMap((item) => {
        const thumbFile = item.fileName.replace('.jpg', '-thumb.jpg');
        return [
          { galleryId: item.uuid, imageId: thumbFile },
          { galleryId: item.uuid, imageId: item.fileName },
        ];
      });
      const tokensRes = await fetchWithAuth('http://localhost:8080/img/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokenRequests),
      });
      const tokensData: { galleryId: string; imageId: string; token: string }[] =
        await tokensRes.json();
      const tokenMap = new Map(
        tokensData.map((t) => [`${t.galleryId}/${t.imageId}`, t.token] as const),
      );
      const newImages = await Promise.all(
        items.map(async (item) => {
          const thumbFile = item.fileName.replace('.jpg', '-thumb.jpg');
          const thumbToken = tokenMap.get(`${item.uuid}/${thumbFile}`) ?? '';
          const fullToken = tokenMap.get(`${item.uuid}/${item.fileName}`) ?? '';
          const thumbnailSrc = `http://localhost:8080/img/${item.uuid}/${thumbFile}?token=${encodeURIComponent(thumbToken)}`;
          const fullSrc = `http://localhost:8080/img/${item.uuid}/${item.fileName}?token=${encodeURIComponent(fullToken)}`;
          return await new Promise<GalleryItem>((resolve) => {
            const img = new Image();
            img.src = thumbnailSrc;
            img.onload = () =>
              resolve({
                src: thumbnailSrc,
                original: fullSrc,
                width: img.naturalWidth,
                height: img.naturalHeight,
                createdAt: item.createdAt,
                exifCreatedAt: item.exifCreatedAt,
              });
            img.onerror = () =>
              resolve({
                src: thumbnailSrc,
                original: fullSrc,
                width: 1,
                height: 1,
                createdAt: item.createdAt,
                exifCreatedAt: item.exifCreatedAt,
              });
          });
        }),
      );
      setImages((prev) => [...prev, ...newImages]);
      setHasMore(!data.last);
      setPage(nextPage + 1);
      setLoading(false);
    },
    [hasMore, loading, page, sortBy, uuid],
  );

  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      await handleUpload(files, {
        onProgress: () => {},
        onSuccess: (file) =>
      setFiles((prev) => prev.filter((f) => f !== file)),
        onError: () => {},
      });
      setFiles([]);
      setUploadSuccess(true);
      await loadMore(true);
    } finally {
      setUploading(false);
    }
  }, [files, handleUpload, loadMore]);

  useEffect(() => {
    if (!uuid || fetchedDescriptions.has(uuid)) return;
    fetchedDescriptions.add(uuid);
    fetchWithAuth(`http://localhost:8080/qrcodes/uuid/${uuid}`)
      .then((res) => res.json())
      .then((data) => setDescription(data.description || ''));
  }, [uuid]);

  useEffect(() => {
    if (!uuid || !tokensInitialized.has(uuid)) return;
    const last = lastSortBy.get(uuid);
    if (last === sortBy) return;
    lastSortBy.set(uuid, sortBy);
    loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, uuid]);
  useEffect(() => {
    if (!uuid || tokensInitialized.has(uuid)) return;
    fetch(`http://localhost:8080/qrcodes/${uuid}/token`)
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem('token', data.token);
        tokensInitialized.add(uuid);
        lastSortBy.set(uuid, sortBy);
        loadMore(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  useEffect(() => {
    function handleScroll() {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMore();
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center bg-background px-4 shadow">
        <NavigationMenu className="ml-auto flex-none" viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Sort By</NavigationMenuTrigger>
              <NavigationMenuContent className="left-auto right-0">
                <ul className="grid w-[300px] gap-4 p-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setSortBy('createdAt');
                        }}
                        data-active={sortBy === 'createdAt'}
                        className="cursor-pointer"
                      >
                        <div className="font-medium">Date added</div>
                        <div className="text-muted-foreground">
                          Uploads will be sorted by the date they were added to the album (newest first).
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setSortBy('exifCreatedAt');
                        }}
                        data-active={sortBy === 'exifCreatedAt'}
                        className="cursor-pointer"
                      >
                        <div className="font-medium">Date captured</div>
                        <div className="text-muted-foreground">
                          Uploads will be sorted by the time they were taken (newest first).
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <Drawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (open) setUploadSuccess(false);
        }}
      >
        <div className="flex flex-col h-screen pt-16">
          <div className="relative h-[75vh] w-full">
            {randomImage ? (
              <img
                src={randomImage.original}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-40"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-300" />
            )}
            <div className="relative z-10 flex h-full flex-col items-center justify-center">
              <p className="mb-4 text-center">{description}</p>
              <DrawerTrigger asChild>
                <Button>+ Add to album</Button>
              </DrawerTrigger>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 text-sm">
              <span>
                {images.length} {images.length === 1 ? 'photo' : 'photos'}
              </span>
              <ArrowDown
                className="h-4 w-4 cursor-pointer"
                onClick={scrollToGallery}
              />
            </div>
          </div>
          <div ref={galleryRef} className="h-[25vh]  p-4">
            <Gallery
              images={images}
              enableImageSelection={false}
              rowHeight={200}
              margin={5}
              onClick={(index) => setLightboxIndex(index)}
            />
          </div>
        </div>
      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => {
          setLightboxIndex(-1);
          setInfoOpen(false);
        }}
        slides={images.map((img) => ({ src: img.original, download: img.original }))}
        plugins={[Download]}
        download={{ download: handleDownloadClick }}
        render={{
          controls: () => (
            <button
              className="absolute top-4 right-28 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
              onClick={() => setInfoOpen(true)}
            >
              <Info className="h-4 w-4" />
            </button>
          ),
        }}
      />
      <DrawerContent className="h-1/2">
        <FileUpload
          accept="image/*"
          value={files}
          onValueChange={setFiles}
          multiple
          className="h-full"
        >
          {uploadSuccess ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="flex gap-2">
                <DrawerHeader>
                  <DrawerTitle className="p-2 text-center">Your uploads are all in!</DrawerTitle>
                  <DrawerDescription className="text-center">Your uploads will show up in the album shortly</DrawerDescription>
                </DrawerHeader>
              </div>
              <div className="flex gap-2 p-4">
                <FileUploadTrigger asChild>
                  <Button onClick={() => setUploadSuccess(false)}>Add More</Button>
                </FileUploadTrigger>
                <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
                  Gallery
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col h-full">
                <div className="flex p-2 justify-end h-14">
                {/* <div className="h-16 p-4 justify-end bg-amber-500"> */}
                  <Button
                    onClick={uploadFiles}
                    disabled={files.length === 0 || uploading}
                    >
                    Upload {files.length} {files.length === 1 ? 'item' : 'items'}
                  </Button>
                </div>

              {/* <div className="grid grid-row-[auto-1fr-auto] h-full bg-gray-600"> */}
                <div className="p-2 items-center justify-center w-full h-30">
                  <FileUploadDropzone className="h-full">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <p className="text-sm text-muted-foreground">
                        Drag and drop photos here or click to upload
                      </p>
                      <FileUploadTrigger asChild>
                        <Button size="sm">Select Photos</Button>
                      </FileUploadTrigger>
                    </div>
                  </FileUploadDropzone>
                </div>                
                <div className="p-2 flex-1 w-full min-h-0">
                {/* <div className="bg-amber-600 w-full"> */}
                  <FileUploadList className="w-full h-full overflow-y-auto">
                    {files.map((file) => (
                      <FileUploadItem key={file.name} value={file}>
                        <div className="flex w-full items-center gap-2">
                          <FileUploadItemPreview />
                          <div className="flex flex-1 flex-col gap-1">
                            <FileUploadItemMetadata />
                            <FileUploadItemProgress />
                          </div>
                          <FileUploadItemDelete asChild>
                            <Button variant="ghost" size="icon">
                              <X className="h-4 w-4" />
                            </Button>
                          </FileUploadItemDelete>
                        </div>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                </div>
              </div>
            </>
          )}
        </FileUpload>
      </DrawerContent>
    </Drawer>
    <Drawer open={infoOpen} onOpenChange={setInfoOpen}>
      <DrawerContent>
        <DrawerHeader>
          {addedInfo && (
            <>
              <DrawerTitle>{addedInfo.title}</DrawerTitle>
              <DrawerDescription>{addedInfo.subtitle}</DrawerDescription>
            </>
          )}
        </DrawerHeader>
        {capturedInfo && (
          <div className="px-4 pb-4">
            <div className="font-semibold">{capturedInfo.title}</div>
            <div className="text-sm text-muted-foreground">{capturedInfo.subtitle}</div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
    </>
  );
}

export default QRCodeGalleryPage;
