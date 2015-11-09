# Leaflet.KMLGroundOverlay
A leaflet plugin to display network-linked, tiled KML GroundOverlays.

*Dependencies:* This library makes use of [Leaflet.imageTransform](https://github.com/ScanEx/Leaflet.imageTransform)

##[Example 1](http://terpconnect.umd.edu/~acartas/Leaflet.KMLGroundOverlay/examples/ex1.html) ##

*This example is hosted on a fairly slow educational server, if there are any suggestions for better way to host this, please let me know. I could not figure out how to get github pages to work properly.*

This plugin is currently only functional for jpg/png images which follow the same format as those of the sample data. It assumes a group of GroundOverlay tiles, with 2^n equally-sized tiles for each level n.

The option *minLod* is not accurately named, but indicates a minimum number of pixels needed on the y-length of the image for it to be drawn at that level. The overlay currently disappears if y-length is less than *minLod/4*.

----------

###Functions###

- setOpacity(opacity)
- float getOpacity()
- int getNumLevels()

###Member Variables###

- options.opacity
- options.minLod: Inaccurately named. This is minimum pixel length of y-side. 
- options.adjust: Boolean. Whether to adjust tiles up/right by 0.5pixels to remove anti-aliasing gaps between tiles. Produces slight overlap if enabled.
- options.fileType: Set this to disable automatic for for jpg/png images, which logs unavoidable 404 errors to console.
- options.numLevels: Set this to disable automatic search for numLevels, which logs unavoidable 404 errors to console. Can also be used to limit max numLevels.
- numLevels: Returns found or given number of levels.





