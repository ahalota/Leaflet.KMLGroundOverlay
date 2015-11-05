# Leaflet.KMLGroundOverlay
A leaflet plugin to display network-linked, tiled KML GroundOverlays.

The basic code should be up here by mid-November, 2015. Currently, this will only work with a specific format of KML GroundOverlays. A more detailed description will follow.

Please keep an eye on this repository! 

Dependencies: This library makes use of [Leaflet.imageTransform](https://github.com/ScanEx/Leaflet.imageTransform)

##[Example 1](http://ahalota.github.com/Leaflet.KMLGroundOverlay/examples/ex1.html)##

This plugin is only functional for jpg/png images, which follow the same format as those of the sample data. It assumes a group of
GroundOverlay tiles, with 2^n tiles for each level n.

The option *minLod* is not exact, and currently indicates a minimum number of pixels needed on the y-length of the image for it to be drawn at that level. The overlay currently disappears if y-length is less than *minLod/4*.

----------

###Functions###

*setOpacity*

*getOpacity*

*getNumLevels*

###Member Variables###

*numLevels*

*options.opacity*

*options.minLod*




