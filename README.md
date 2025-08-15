# Full Stack Example

This project contains a React frontend and a Spring Boot backend that provides
user management with role based access. Authentication uses simple bearer tokens
issued by the backend.

## TODO

- New QR, extractEXIFdata boolean
- Move processed files to UUID folder
- Thumbnails
- Different Camel routes cannot poll from same folder


- Enabled, start / stop route
- Pool from multiple folders where enabled = true


New backend CRUD apis to store

- com.example.demo.model.rbac.Permission
- com.example.demo.model.rbac.Role
- com.example.demo.model.rbac.Tenant
- com.example.demo.model.rbac.UserRole


On JpgPollingRoute
- Instead of polling from @Value("${polling_folder_path}")
- Get all ConnectionFolder from ConnectionFolderRepository
- For each ConnectionFolder, create a new polling route.
  - Do not auto start the route.

On DataInitializer
- Create three sample data rows for com.example.demo.model.ConnectionFolder

On AppSidebar
- Add new "Folder" option, next to FTP
  - When user clicks on "Folder" button, show a new "Folder" page to the right side of the sidebar.
  - "Folder" page will pull data from ConnectionFolderController backend
    - Breadcrum Title: Folder ('@/components/ui/breadcrumb')
    - second row, Search Folder and Create "+ Connection button" justified to the right.
      - "+ Connection button" will redirect the user to a new "Connection Form", add Test Path, Cancel, Save buttons
    - third row, table with list of connections.
      - fields for connection table
        - Name
        - Path
        - Enabled
        - Elipsis button will show a dropdown (@/components/ui/dropdown-menu) with Edit, Delete buttons.
          - Delete button, shows alert dialog (@/components/ui/alert-dialog)
            - Alert title: Delete selected connection?
            - Alert subtitle: This action cannot be undone
            - When a button is clicked, perform the action and hide the alert
        - When user clicks on a row show the Connection Form in read only mode, hide Cancel, Save buttons
        - When user clicks on Edit button show the Connection Form in edit mode, show all buttons

On Login.tsx
- Create Combobox for Tenants
  - Use @/components/ui/command to show list of Tenants (not the ids)
  - Select SuperTenant by default
  - Search must work
On RoleForm
- Search Tenant... popup not working
- Add Permission multi-select
  - Populate Permission multi-select with the Permission name isntead of the id

## Backend

The backend lives in the `backend` folder. It requires Java 21 and Maven.

```
cd backend
mvn spring-boot:run
```

Two users are created on startup:

- `admin` / `password` – has `ADMIN` role
- `user` / `password` – has `USER` role

The backend allows cross-origin requests from `http://localhost:5173` so the
React app can communicate with it during development.

Swagger UI is enabled at `http://localhost:8080/swagger-ui/index.html` for
exploring the available APIs.
After retrieving a token from the `/login` endpoint, click **Authorize** in
Swagger UI and enter `Bearer <token>` to authenticate requests.

Logging is configured via `logback.xml` in `backend/src/main/resources`, which
prints timestamps, level, thread, and logger names to the console.

## Frontend

The React frontend uses Tailwind and shadcn components. Start it with:

```
npm run dev
```

After logging in you can manage users if your account has the `ADMIN` role.
The Users page allows creating new users as well as editing or removing
existing ones. When editing, you can also update a user's password.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

### npm

```
npm install react-router-dom @types/react-router-dom
```