package com.example.demo.storage;

import java.io.IOException;
import java.io.InputStream;
import java.nio.channels.Channels;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class FileSystemStore {
    private final Path root;

    public FileSystemStore(@Value("${storage.root}") String root) {
        this.root = Path.of(root);
    }

    public InputStreamRange open(String key, String range) throws IOException {
        Path p = root.resolve(key).normalize();
        if (!p.startsWith(root)) throw new SecurityException("path-traversal");
        long size = Files.size(p);
        long start = 0, end = size - 1;
        if (range != null && range.startsWith("bytes=")) {
            String[] parts = range.substring(6).split("-", 2);
            if (!parts[0].isEmpty()) start = Long.parseLong(parts[0]);
            if (!parts[1].isEmpty()) end = Long.parseLong(parts[1]);
        }
        var channel = FileChannel.open(p, StandardOpenOption.READ);
        channel.position(start);
        return new InputStreamRange(Channels.newInputStream(channel), size, start, end);
    }

    public record InputStreamRange(InputStream in, long size, long start, long end) {}
}
