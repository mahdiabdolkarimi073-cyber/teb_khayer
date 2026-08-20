import React, { useEffect } from 'react';
import OpenSeadragon from 'openseadragon';

const ZoomableImage = ({ imagePath }: any) => {
    useEffect(() => {
        const viewer = OpenSeadragon({
            id: 'openseadragon1',
            prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/2.4.2/images/',
            tileSources: {
                type: 'image',
                url: imagePath
            }
        });

        return () => {
            viewer.destroy();
        };
    }, [imagePath]);

    return <div id="openseadragon1" style={{ width: '100%', height: '600px' }} />;
};

export default ZoomableImage;
