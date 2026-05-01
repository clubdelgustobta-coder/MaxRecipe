import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';

export function getFileId(url) {
    if (!url) return null;
    const lh3 = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (lh3) return lh3[1];
    const id = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (id) return id[1];
    const file = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (file) return file[1];
    return null;
}

export function lh3Url(id) {
    return `https://lh3.googleusercontent.com/d/${id}`;
}

export function thumbnailUrl(id) {
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
}

// Obtiene las dimensiones probando lh3 primero, luego thumbnail
export function getDriveImageSize(uri, onSize) {
    const id = getFileId(uri);
    if (!id) { Image.getSize(uri, (w, h) => onSize(w, h), () => {}); return; }

    Image.getSize(lh3Url(id), (w, h) => {
        if (w > 0) onSize(w, h);
    }, () => {
        Image.getSize(thumbnailUrl(id), (w, h) => {
            if (w > 0) onSize(w, h);
        }, () => {});
    });
}

// Componente imagen con fallback automático lh3 → thumbnail
export default function DriveImage({ uri, style, resizeMode = 'cover' }) {
    const [useFallback, setUseFallback] = useState(false);

    useEffect(() => { setUseFallback(false); }, [uri]);

    const id = getFileId(uri);
    const src = id
        ? (useFallback ? thumbnailUrl(id) : lh3Url(id))
        : uri;

    return (
        <Image
            source={{ uri: src }}
            style={style}
            resizeMode={resizeMode}
            onError={() => { if (!useFallback) setUseFallback(true); }}
        />
    );
}
