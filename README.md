<p align="center">
  <a href="nadhi.dev">
    <img src="https://i.ibb.co/svXmNbNZ/WARNING-2-modified.png" alt="Banner with Pyrodactyl Logo">
  </a>

</p>

<p align="center">
 
 <!---<a aria-label="Join the Pyrodactyl community on Discord" href="https://discord.gg/UhuYKKK2uM?utm_source=githubreadme&utm_medium=readme&utm_campaign=OSSLAUNCH&utm_id=OSSLAUNCH"><img alt="" src="https://i.imgur.com/qSfKisV.png"></a>
</p>-->

<h1 align="center">Sytation Framework</h1>
<h3 align="center">The Faster Inertia Alternative</h3>

> [!WARNING]
> Sytation ships with Google Auth out of the box! This means you need to configure authentication yourself.

> [!WARNING]
> Sytation is still under construction, And we recommend you not push this build to production

> [!IMPORTANT]
> Sytation was developed on MacOS. Please check if all sytation API(s) work on your operating System. Sytation Dev Tools were also only tested on Chrome.









# How to setup Sytation on any Machine

1. Install Node.js and PHP. 

2. Installing Composer and Laravel:
```bash
# Install Composer globally
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
php -r "unlink('composer-setup.php');"
```



3. Create `.env` file from the example:
```bash
cp .env.example .env
```

4. Generate an application key:
```bash
php artisan key:generate
```



5. Run Laravel and React dev server concurrently:
```bash
npm run dev
```

6. Preview production build:
```bash
npm run production
```

## Core Utilities

This framework includes several powerful utilities to make development easier:

### HttpClient

A typed HTTP client wrapper around Axios for making API requests.

```typescript
// GET request with type safety
const data = await HttpClient.get<UserType>('/api/user');

// POST request with data
await HttpClient.post('/api/comments', { text: 'Great post!' });

// File upload with progress
await HttpClient.upload('/api/avatar', formData, (progress) => {
    console.log(`Upload progress: ${progress}%`);
});
```

Features:
- Automatic CSRF token handling
- Progress bar for all requests
- Authentication error handling (redirects to login)
- Type-safe responses with generics
- File upload with progress tracking

### QuickDB

A client-side encrypted data store built on localStorage/sessionStorage.

```typescript
// Store user data in an encrypted instance
QuickDB.User.set('profile', userData);

// Retrieve data
const profile = QuickDB.User.get('profile');

// Check if data exists
if (QuickDB.User.has('settings')) {
    // Data exists
}

// Create a custom encrypted instance
const SecureDB = QuickDB.createInstance('SecureData', true);
```

Features:
- Automatic encryption with peer keys
- Multiple isolated storage instances
- Built-in logging system
- Interactive data management
- Persists across sessions with localStorage

### Link (Server-Side Data Sync)

A utility for synchronizing data between client and server for server-side rendering.

```typescript
// Update server-side data
await Link.change({ user: { name: 'John' } });

// Clear server-side data
await Link.clear();

// Control page reloading behavior
Link.change(data, true);  // Force page reload
Link.change(data, false); // Prevent page reload
```

Features:
- Server-side data synchronization
- Automatic page reloading with scroll position preservation
- Control over reload behavior

## Server-Side Rendering with Dynamic Data

This framework provides a system for passing data from the server to client:

1. Server Side Data: Laravel blade templates inject data via `window.ssr.props`
2. Data Persistence: The DataStoreController manages server-side data state
3. Client Access: React components can access this data via `window.ssr.props`
4. Synchronization: Link utility allows updating server data from client

```php
// In your Laravel controller
public function index()
{
        return view('app', [
                'user' => Auth::user(),
                'settings' => Settings::all()
        ]);
}
```

```tsx
// In your React component
const userData = window.ssr.props.user;
```

## Routes 

### Web Routes (`routes/web.php`)

```php
Route::get('/{any}', function () {
        return view('app');
})->where('any', '^(?!api).*');
```

Available routes:
- Home: `http://localhost:8000`
- Login: `http://localhost:8000/auth/login`
- 404: `http://localhost:8000/i-dont-exist`

### API Routes (`routes/api_v1.php`)

```php
// Data synchronization routes
Route::get('data-change', [DataStoreController::class, 'store']);
Route::get('data-clear', [DataStoreController::class, 'clear']);

// Authenticated API (sanctum)
Route::group([
        'middleware' => ['api_authenticated']
], function() {
        Route::get('/example-authenticated', [ExampleController::class, 'authenticated']);
});

// Public API
Route::group([
        'middleware' => ['api_public'],
], function () {
        Route::get('/example', [ExampleController::class, 'index']);
});
```

## Middleware Groups 

Middleware groups `web`, `api_public` and `api_authenticated` are defined in `app/Http/Kernel.php`

## Vite Environment Variables

Any `.env` file variables prefixed with `VITE_` will be accessible in React using `import.meta.env`.

This is configured in `vite.config.ts`:

```typescript
// vite.config.ts
define: {
        __APP_ENV__: JSON.stringify(env.APP_ENV),
}
```

For typings, add definitions to `resources/app/env.d.ts`.

## Documentation

[Laravel Documentation](https://laravel.com/docs/10.x)
