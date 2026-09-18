module.exports = function configureBabel(api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [["relay", {
      artifactDirectory: `${__dirname}/src/__generated__`,
    }]],
  };
};
