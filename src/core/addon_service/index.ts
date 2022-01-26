let que:Array<Function> = [];

let attatch = (func:Function) => {
    que.push(func);
};

let start = () => {
    que.forEach((func) => func());
};

export const addons = {
    attatch: (func:Function) => attatch(func),
}

export const server = {
    start: () => start(),
}