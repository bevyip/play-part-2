# Image to Sprite Generator

A web application that converts images into pixel sprite representations with multiple views (front, back, left, right).

## Features

- Upload images and convert them to pixel sprites
- Automatic background removal
- Multiple sprite views (front, back, left, right)
- Color palette extraction
- Export ready-to-use JavaScript code

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your project in [Vercel](https://vercel.com)
3. Vercel will automatically detect the Vite framework
4. The build will use the configuration in `vercel.json`

### Environment Variables (Optional)

If you need to use the Gemini API in the future, add this environment variable in Vercel:

- `GEMINI_API_KEY` - Your Google Gemini API key

Note: Currently, the application uses client-side image processing and doesn't require an API key.

## Project Structure

- `components/` - React components
- `logic/` - Core sprite generation logic
- `utils/` - Utility functions
- `types.ts` - TypeScript type definitions

