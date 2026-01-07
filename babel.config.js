module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            // Required for animations to work (fixes _toString error)
            "react-native-reanimated/plugin",
        ],
    };
};