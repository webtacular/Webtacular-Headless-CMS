export default class {
    input: any;
    version: [number, number, number];
    versions: Map<[number, number, number], any>;
    latestVersion: [number, number, number];

    constructor(
        input: any,
        version: [number, number, number],
        versions: Map<[number, number, number], any>,
        latestVersion: [number, number, number],
    ) {
        this.input = input;
        this.version = version;
        this.versions = versions;
        this.latestVersion = latestVersion;
    }

    latest() {
        // Check if the current version is the latest version
        if (this.version[0] === this.latestVersion[0] &&
            this.version[1] === this.latestVersion[1] &&
            this.version[2] === this.latestVersion[2]) return this.input;

        // Find all the versions that are newer than the current version, in order
        let versions: Array<[number, number, number]> = [];

        // Find the latest version
        this.versions.forEach((schema, c_version) => {
            if (c_version[0] > this.version[0] ||
                (c_version[0] === this.version[0] && c_version[1] > this.version[1]) ||
                (c_version[0] === this.version[0] && c_version[1] === this.version[1] && c_version[2] > this.version[2])) versions.push(c_version);
        });

        // Sort the versions
        versions.sort((a, b) => {
            if (a[0] > b[0]) return 1;
            if (a[0] < b[0]) return -1;

            if (a[1] > b[1]) return 1;
            if (a[1] < b[1]) return -1;

            if (a[2] > b[2]) return 1;
            if (a[2] < b[2]) return -1;

            return 0;
        });

        // Update the input
        versions.forEach((version, i) => {
            const schema = this.versions.get(version);

            this.input = schema.update(this.input);
        });

        return this.input;
    }
}