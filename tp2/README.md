### [TP2 - Development of a 3D graphics application](tp2)

#### Project Description



In the course of the second project, we decided on building a Christmas-themed room to match the Holiday Spirit. This includes a Christmas tree with presents underneath it, a big Santa Claus painting, a fireplace with logs aside it, three chairs to sit comfortably in next to the fire, and an eletrical piano to fill the air with magical tunes.

#### Scene

The room is contained inside a skybox, that tries to resemble the outside world.

![Skybox](tp2/Screenshots/skybox.png)

The Fireplace is one of our most complex objects, having three different Geometries in its use: (Rectangle, UnitCube, and CylinderGeometry). For the base and the divider between the Fireplace and the Chimney, we opted on using a scaled UnitCube with a wooden texture applied to it to resemble a more rustic look. As for the fireplace itself, we opted on using an UnitCube as well, but with a granite-like bump texture this time, to have a more stoney look, as well as a Rectangle to compose the visor, with a video texture of fire burning. On the other hand, while building the Chimney, we decided on using a CylinderGeometry with 4 slices as we believed it would be the best way to make it look like a prism, while applying the same granite texture as before. For each log, we also used the CylinderGeometry and a lighter wooden bump texture, to add a rough feeling to the entire object. It's important to note that, when viewing from a higher distance, the logs become a prism of the same texture, to optimize the scene's rendering.

![Fireplace](tp2/Screenshots/fireplace.png)

As for the Tree, we decided on using a three-fold construction, where each segment uses a CylinderGeometry to 
give the overall object the aspect of different layers stacked on each other, with the wireframe attribute active. We also chose to place several Christmas Balls to ornament the Tree, using BufferGeometry on each one of them, with different colors applied. From a large distance, the Tree becomes a simple cone (also using CylinderGeometry) to, once again, optimize the rendering. In addition to this, we also added a Prism to resemble a Star on top of the tree, with a Golden Light inside it, simulating the Star's Brightness. To add complexity to the object, we chose to add three different point lights that flicker over time. The gifts underneath it were built using simple unitcubes, with textures manipulated by us to better resemble a Christmas present. 

![Tree and Gifts](tp2/Screenshots/tree_and_gifts.png)

The chairs were built by combining differently scaled UnitCubes and by applying a wodden texture to the overall object. They are also manipulable via the Interface, as we show in the last point. 

![Chairs](tp2/Screenshots/chairs.png)

The eletric piano was also built using UnitCubes and the CylinderGeometry. For the stool, we decided to build a backless chair, to reallistically resemble a piano stool, using UnitCubes for both the legs, and the seat. As for the instrument itself, we decided on constructing a cylinder base, as it would be the most similar to the ones sustaining real-life pianos, as well as a simple keyboard, with no extra buttons apart from the keys. The base was built using six different Cylinders, two directly below the keyboard, two directly above the ground, and two intersecting in the middle, forming a cross to provide stability.
The piano is also built taking into account the distance from where the user is seeing it. From a short range, it presents immense detail, including realistic keys. From medium range, some keys become invisible, as well as the gap between the white keys, and from long range, only a white blur is visible on the keyboard, to better fit the human perception at such a distance. 

![Piano](tp2/Screenshots/piano.png)

While building the painting, we decided on implementing 3 different paintings using different mipmapping techniques. For the Christmas one, we chose to allow automatic mipmapping, whereas for the other 2 paintings, we manually created textures for every mipmap level, them being (256x256, 128x128, 64x64, 32x32, 16x16, 8x8). We also allow the user to select the far and close filter that better fits their desire on the interface. 

![Painting](tp2/Screenshots/painting.png)

We can, at most, have 6 visible lights in scene at the same time. These lights include the 4 on the Christmas Tree, and an additional PointLight and Directional Light, created purely to lighten the overall scene. All lights have the ability to cast shadows on every object. 

![Lights and Shadows](tp2/Screenshots/light_and_shadows.png)

On our interface we allow a detailed scene customization of two different types: Attributes only working on our scene, Attributes working on every possible scene. 
For the scene-exclusive customization, we provide position sliders for each one of the chairs, different choseable paintings and toggles that allow an object to be converted to a wireframe. 
For the general customizable attributes, we allow the user to hide every texture and apply or not apply bumps to them by clicking on the checkbox, as well as change the scale of every bump texture on the scene using a slider. 

![Interface](tp2/Screenshots/interface.png)