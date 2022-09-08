const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    main: './rsite/js/main.jsx',
    resume: './rsite/js/resume.jsx',
    new: './rsite/js/new_resume.jsx',
    edit: './rsite/js/builder.jsx',
    password: './rsite/js/password.jsx',
    newpassword: './rsite/js/new_password.jsx',
    username: './rsite/js/username.jsx',
  },
  output: {
    path: path.join(__dirname, '/rsite/static/js/'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        // Test for js or jsx files
        test: /\.jsx?$/,
        // Exclude external modules from loader tests
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
          plugins: ['@babel/transform-runtime'],
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
