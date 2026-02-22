# E-Commerce React Application

A modern e-commerce application built with React that allows administrators to add products which are then visible to all users.

## Features

- Admin panel for product management
- Product browsing for all users
- Secure admin authentication
- Enhanced product storage system
- Responsive design

## Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/Yahia-Dev-1/E-Commer-React.git
cd E-Commer-React
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the development server:
```bash
npm start
```

## Deployment to Vercel

This project is configured for deployment to Vercel. To deploy:

1. Install the Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy the project:
```bash
vercel --prod
```

Alternatively, you can connect your GitHub repository to Vercel for automatic deployments.

## Backend Configuration

The application uses localStorage for product storage on the client side, but is configured for Vercel deployment with the following `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Admin Credentials

Default admin accounts:
- yahiapro400@gmail.com
- yahiacool2009@gmail.com

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.