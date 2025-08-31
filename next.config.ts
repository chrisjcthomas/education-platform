import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  
  // Configure headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  
  // Webpack configuration for Monaco Editor and Pyodide
  webpack: (config, { isServer }) => {
    // Monaco Editor configuration
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    });
    
    // Enhanced Pyodide configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
      };
      
      // Handle WebAssembly
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        layers: true,
      };
      
      // Handle .wasm files
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'webassembly/async',
      });
    } else {
      // Exclude Pyodide from server-side rendering
      config.externals = config.externals || [];
      config.externals.push('pyodide');
    }
    
    return config;
  },
};

export default nextConfig;
