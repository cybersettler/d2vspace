module.exports = {
    persistence: {
        catalog: [
            // supported attributes include NeDB options object
            // see https://github.com/louischatriot/nedb#creatingloading-a-database
            {
                collectionName: "textures",
                schema: "textures/schema.json",
                filename: "textures/index.json"
            }
        ]
    },
    resources: {
        i18n: "frontend/assets/locales",
        textures: {
            type: "database"
        }
    }
};
