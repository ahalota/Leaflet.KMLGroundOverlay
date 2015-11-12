# Leaflet.KMLGroundOverlay
A leaflet plugin to display network-linked, tiled KML GroundOverlays.

*Dependencies:* This library makes use of [Leaflet.imageTransform](https://github.com/ScanEx/Leaflet.imageTransform)

This plugin is currently only functional for images which follow the same format as those of the sample data. It assumes a group of GroundOverlay tiles, with 2^n equally-sized tiles for each level n. [More details on KML Super-Overlays](https://developers.google.com/kml/documentation/kml_21tutorial?csw=1#superoverlays) and how to [generate them with gdal2tiles](https://developers.google.com/kml/articles/raster?hl=en).

##[Example 1](http://ahalota.github.io/Leaflet.KMLGroundOverlay/examples/ex1.html) ##




----------

###Functions###

- setOpacity(opacity)
- float getOpacity()
- int getNumLevels()

###Options###

- opacity
- minLod: Inaccurately named. This is minimum pixel length of y-side.
- minZoom: Layer disappears if map.getZoom() is smaller than this value.
- adjust: Boolean. Whether to adjust tiles up/right by 0.5pixels to remove anti-aliasing gaps between tiles. Produces slight overlap if enabled.
- fileType: Set this to disable automatic search for jpg/png images, which logs unavoidable 404 errors to console.
- numLevels: Set this to disable automatic search for numLevels, which logs unavoidable 404 errors to console. Can also be used to limit max numLevels.
- minFileSize: Set a minimum file size required for an image to be added as a tile. Use this when you have empty images in your tile structure that you want to ignore for efficiency.

###Member Variables###

- numLevels: Returns found or given number of levels.





