<p align="center">
  <a href="#">
    <img src="/.github/ressources/PostSync.svg" alt="logo" width="175px">
  </a>
</p>
<h2 align="center">Sync Your Postman Docs. Power Your API.</h2>

PostSync turns your Postman collection into a type-safe, auto-synced API client. Generate TypeScript-safe calls, streamline fetch requests, and integrate seamlessly.

## 🚀 Features

- 🔄 **Postman Integration** – Convert Postman collections into structured API clients.
- 🔒 **Type-Safe API Calls** – Fully typed request and response handling.
- ⚡ **Automated Fetch Requests** – No more manual API configurations.
- 🛠️ **Standardized Error Handling** – Centralized response processing.
- 📄 **Auto-Generated Endpoints** – Keep your API in sync with your documentation.

## 📦 Installation

```sh
npm install postsync
```

or

```sh
yarn add postsync
```

## 🔧 Usage

```typescript
import { createApiClient } from 'postsync';
import postmanDoc from './postman-collection.json';

const api = createApiClient(postmanDoc, {
  baseUrl: 'https://api.example.com',
  defaultHeaders: { 'Content-Type': 'application/json' }
});

async function getUserData(userId: string) {
  const user = await api.users.get.getUserById({ pathParams: { id: userId } });
  return user;
}
```

## 📖 Why Use PostSync?

✅ **Automates API Integration** – No more repetitive fetch configurations.  
✅ **Keeps Documentation & Code in Sync** – Update Postman, and your client updates too.  
✅ **Boosts Developer Productivity** – Focus on features, not API calls.  
✅ **Reduces Bugs** – Type safety ensures valid requests every time.  

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit PRs to improve PostSync.

## 📜 License

MIT License © 2025 PostSync# postsync
