Triangles
=========

Almost entirely pointless plugin to create a triangle based trail that follows your mouse, or on a touchscreen device, uses the tilt of the device to create the trail. See the included example.

Usage
-----

$('.js-tri').triangles();

Markup
------

&lt;div class="trianglewrapper"&gt;
    &lt;canvas id="canvas0" class="triangles js-tri"/&gt;
&lt;/div&gt;

The canvas element must have an id and it must be unique.

The element .trianglewrapper must either have a width and height set or one must be automatically enforced by putting an image inside it. The plugin will convert the canvas to be absolutely positioned over whatever is in the parent and size it to match the parent.

In the example provided the canvas has been styled with a background image of a 'grid' to match the outputted triangles, but this is not required by the plugin.

Options
-------

- triangleWidth: number, width of the outputted triangles.
- triangleHeight: number, height of the outputted triangles. Both width and height default to 28 and do not scale. Note that width and height do not have to be equal.
- colour: string representing an rgb colour value for the outputted triangles, defaults to blue, '38,60,73'
- surrogate: classname of an element that is positioned on top of the canvas but should still allow interaction with the canvas. Should be in the form '.class'
