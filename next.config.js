module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://ton-backend.render.com/:path*",
      },
    ];
  },
};
