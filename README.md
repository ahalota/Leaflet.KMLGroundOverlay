# Leaflet.KMLGroundOverlay 
A leaflet plugin to display network-linked, tiled KML GroundOverlays.

*Dependencies:* This library makes use of [Leaflet.imageTransform](https://github.com/ScanEx/Leaflet.imageTransform)

##[Example 1](http://ahalota.github.io/Leaflet.KMLGroundOverlay/examples/ex1.html) ##

This plugin is currently only functional for images which follow the same format as those of the sample data. It assumes a group of GroundOverlay tiles, with 2^n equally-sized tiles for each level n.

----------

###Functions###

- setOpacity(opacity)
- float getOpacity()
- int getNumLevels()

###Options###

- opacity
- minLod: Inaccurately named. This is minimum pixel length of y-side. Currently used as maxZoom as well, with layer disappearing if level 0 has y-side < minLod/4.
- adjust: Boolean. Whether to adjust tiles up/right by 0.5pixels to remove anti-aliasing gaps between tiles. Produces slight overlap if enabled.
- fileType: Set this to disable automatic for for jpg/png images, which logs unavoidable 404 errors to console.
- numLevels: Set this to disable automatic search for numLevels, which logs unavoidable 404 errors to console. Can also be used to limit max numLevels.

###Member Variables###

- numLevels: Returns found or given number of levels.





