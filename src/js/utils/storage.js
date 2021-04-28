export function set(name, value) {
    const jsonValue = JSON.stringify(value);
    localStorage.setItem(name, jsonValue);
}

export function get(name, substitute = null) {
    const storageValue = JSON.parse(localStorage.getItem(name) || substitute);

    return storageValue;
}

export function del(name) {
    localStorage.removeItem(name);
}
