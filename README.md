# Leaflet.KMLGroundOverlay
A leaflet plugin to display network-linked, tiled KML GroundOverlays.

*Dependencies:* This library makes use of [Leaflet.imageTransform](https://github.com/ScanEx/Leaflet.imageTransform)

##Example 1##

**I can't figure out how to link to an on-line copy of the example. Can anyone help?**

This plugin is currently only functional for jpg/png images which follow the same format as those of the sample data. It assumes a group of GroundOverlay tiles, with 2^n tiles for each level n.

The option *minLod* is not accurately named, but indicates a minimum number of pixels needed on the y-length of the image for it to be drawn at that level. The overlay currently disappears if y-length is less than *minLod/4*.

----------

###Functions###

- setOpacity(opacity)
- float getOpacity()
- int getNumLevels()

###Member Variables###

- numLevels
- options.opacity
- options.minLod




