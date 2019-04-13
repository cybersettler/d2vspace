module.exports = {
    persistence: {
        catalog: [
            // supported attributes include NeDB options object
            // see https://github.com/louischatriot/nedb#creatingloading-a-database
            {
                collectionName: "components",
                schema: "components/schema.json",
                filename: "components/index.txt"
            }, {
                collectionName: "bodies",
                schema: "bodies/schema.json",
                filename: "bodies/index.txt"
            }, {
                collectionName: "materials",
                schema: "materials/schema.json",
                filename: "materials/index.txt"
            }, {
                collectionName: "geometries",
                schema: "geometries/schema.json",
                filename: "geometries/index.txt"
            }, {
                collectionName: "textures",
                schema: "textures/schema.json",
                filename: "textures/index.txt"
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
