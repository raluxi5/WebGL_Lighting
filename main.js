const { mat3, mat4, vec3, vec4} = glMatrix;

var canvas;
var gl;

//Shapes
//array of the shapes that will be on the scene
var shapes = [];

//selected element
var selected;

//Initial values for the transformations
var rotatex = 0;
var rotatey = 0;
var rotatez = 0;
var scaling = [0.7,0.7,0.7];


//Shapes seen from the positive z-axis
var eye = [0,0,2];
//Where the eye will look at
var target = [0,0,0];

//Light
var gouraud = false;
var phong = true;

//Point light-source vector
//w component = 1 for point light-source
const lightPosition = [0, 10, 0, 1 ];

//vectors which create the lighting components
//LightColor and MaterialColor for the shapes
var ambientLightColor = [];
var diffuseLightColor = [];
var specularLightColor = [];

var ambientMaterialColor = [];
var diffuseMaterialColor = [];
var specularMaterialColor = [];
var materialShininess;

//final light that will pe applied
var Iambient, Idiffuse, Ispecular;

//Data for shapes
var program;
var text1;
var text2;
var text3;


//Async function for loading the .obj file
window.onload = async function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }


    //Load the .obj files
    const response1 = await fetch('sphere.obj');
    text1 = await response1.text();

    const response2 = await fetch('cone.obj');
    text2 = await response2.text();

    const response3 = await fetch('teapot.obj');
    text3 = await response3.text();

    program = shaders(gl, "Pvertex-shader", "Pfragment-shader");

    let x1 = -4;
    let x2 = -4;
    for(var i = 1 ; i<=8 ; i++){
        //spheres
        if(shapes.length<=4){
            shapes[i] = new createOBJShape(gl,program, text1,[x1+1, -2 ,-5], scaling, rotatex, rotatey, rotatez,eye, target);
            x1+=2;
        }
        //cones
        else{
            shapes[i] = new createOBJShape(gl,program, text2,[x2+1, 0 ,-5], scaling, rotatex, rotatey, rotatez,eye, target);
            x2+=2;
        }
    }
    //teapot
    shapes[9] = new createOBJShape(gl,program, text3,[0,1.5 ,-5], scaling, rotatex, rotatey, rotatez,eye, target);


    //Default lighting is the Phong shading with specular light
    defaultLight();

    function drawScene() {
        requestAnimationFrame(drawScene);

        gl.clearColor(0.6, 0.6, 0.7,1);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);

        gl.viewport(0, 0, canvas.width, canvas.height);

        //camera movement
        if(cPressed)
            cameraMove();

        //drawing of the shapes
        for(var i =1; i<=9;i++)
            shapes[i].renderShape();

        //global transformations with all shapes
        if(zero){
            for(var i =1; i<=9;i++)
                shapes[i].transformations();
        }
        if(!selected)
            selected = shapes[9]; //teapot default selected
        //only the selected shape will perform the local transformations
        selected.transformations();
    }

    window.addEventListener("keydown", function (event){

        //selection of shapes with keyboard number
        for(var i = 1; i<=9;i++) {
            if (event.key === i.toString())
                selected = shapes[i];
        }

        switch(event.key){

            //Gouraud shading with diffuse light
            case 'u': {

                //Light Type
                gouraudDiffuse();
                putObjonScene();

                break;
            }
            //Gouraud shading with diffuse light and specular highlight
            case 'i': {

                //Light Type
                gouraudSpecular();
                putObjonScene();

                break;
            }
            //Phong shading with diffuse light
            case 'o':{

                //Light type
                phongDiffuse();
                putObjonScene();

                break;
            }
            //Phong shading with diffuse light
            case 'p': {

                //Light Type
                phongSpecular();
                putObjonScene();

                break;
            }
            //Switch between illumination models
            case 'L':{
                if(gouraud === false){

                    gouraud = true;
                    phong = false;
                    program = shaders(gl, "Gvertex-shader", "Gfragment-shader");
                    //gouraudDiffuseSpecular();
                    gouraudDiffuse();
                    putObjonScene();

                }
                else if(phong === false){

                    gouraud = false;
                    phong = true;
                    program = shaders(gl, "Pvertex-shader", "Pfragment-shader");
                    //phongDiffuseSpecular();
                    phongDiffuse();
                    putObjonScene();

                    break;
                }

            }
        }
    });

    //Drawing starts here
    requestAnimationFrame(drawScene);
}

function putObjonScene()
{
    var shapes = [0];

    let x1 = -4;
    let x2 = -4;
    for(var i = 1 ; i<=8 ; i++){
        //spheres
        if(shapes.length<=4){
            shapes[i] = new createOBJShape(gl,program, text1,[x1+1, -2 ,-5], scaling, rotatex, rotatey, rotatez,eye, target);
            x1+=2;
        }
        //cones
        else{
            shapes[i] = new createOBJShape(gl,program, text2,[x2+1, 0 ,-5], scaling, rotatex, rotatey, rotatez,eye, target);
            x2+=2;
        }
    }
    //teapot
    shapes[9] = new createOBJShape(gl,program, text3,[0,1 ,-5], scaling, rotatex, rotatey, rotatez,eye, target);

    for(var i =1; i<=9;i++)
        shapes[i].renderShape();
}


function cameraMove (){

    moveCamera(eye);

    vec3.add(target, eye, [0,0,-1]);
    moveCamera(eye);
    vec3.add(target, eye, [0,0,-1]);

}

function defaultLight(){

    phongDiffuse();

}
//Ambient and diffuse light with Gouraud Shading
function gouraudDiffuse(){

    program = shaders(gl, "Gvertex-shader", "Gfragment-shader");

    ambientLightColor = [0.2, 0.2, 0.2, 1];
    ambientMaterialColor = [0.13, 0.22, 0.15, 1];
    diffuseLightColor = [0.5, 0.5, 0.5, 1];
    diffuseMaterialColor = [0.54, 0.89, 0.63, 1];

    //no specular highlight
    specularLightColor = [0, 0, 0, 0];
    specularMaterialColor = [0, 0, 0, 0];
    materialShininess = 1;

    setLightElements(ambientLightColor, diffuseLightColor, specularLightColor,
        ambientMaterialColor, diffuseMaterialColor, specularMaterialColor);
}

//Ambient + specular light with Gouraud shading
function gouraudSpecular(){

    program = shaders(gl, "Gvertex-shader", "Gfragment-shader");

    ambientLightColor = [0.5, 0.5, 0.5, 1];
    ambientMaterialColor = [.54,.8,.64, 1];
    //no diffuse light
    diffuseLightColor = [0,0,0,0];
    diffuseMaterialColor = [0,0,0,0];

    specularLightColor = [1, 1, 1, 1 ];
    specularMaterialColor = [ 1, 1, 1, 1];
    materialShininess = 30.0;

    setLightElements(ambientLightColor, diffuseLightColor, specularLightColor,
        ambientMaterialColor, diffuseMaterialColor, specularMaterialColor);
}
//Ambient and diffuse light with Phong shading
function phongDiffuse(){

    program = shaders(gl, "Pvertex-shader", "Pfragment-shader");

    ambientLightColor = [0.5, 0.5, 0.5, 1];
    ambientMaterialColor = [0.13, 0.22, 0.15, 1];
    diffuseLightColor = [1, 0.5, 1, 1];
    diffuseMaterialColor = [0.54, 0.89, 0.63, 1];

    //no specular highlight
    specularLightColor = [0, 0, 0, 0];
    specularMaterialColor = [0, 0, 0, 0];
    materialShininess = 100;

    setLightElements(ambientLightColor, diffuseLightColor, specularLightColor,
        ambientMaterialColor, diffuseMaterialColor, specularMaterialColor);
}
//Ambient + specular light with Phong shading
function phongSpecular(){

    program = shaders(gl, "Pvertex-shader", "Pfragment-shader");

    ambientLightColor = [1, 0.5, 1, 1];
    ambientMaterialColor = [0.54, 0.89, 0.63, 1];
    //no diffuse light
    diffuseLightColor = [0,0,0,0];
    diffuseMaterialColor = [0,0,0,0];

    specularLightColor = [1, 1, 1, 1 ];
    specularMaterialColor = [ 1, 1, 1, 1];

    materialShininess = 20.0;

    setLightElements(ambientLightColor, diffuseLightColor, specularLightColor,
        ambientMaterialColor, diffuseMaterialColor, specularMaterialColor);
}

//Sets the lighting components
//multiplies the light color with the material coefficient to be sent to the shaders
function setLightElements(lightAmbient, lightDiffuse, lightSpecular, materialAmbient, materialDiffuse, materialSpecular){

    Iambient = vec4.create();
    Idiffuse = vec4.create();
    Ispecular = vec4.create();

    vec4.multiply(Iambient,lightAmbient, materialAmbient);
    vec4.multiply(Idiffuse,lightDiffuse, materialDiffuse);
    vec4.multiply(Ispecular,lightSpecular, materialSpecular);

}


function perspective(pmatrix){

    const fieldOfView = 45 * Math.PI / 180;
    //width/height ratio that matches the display size of the canvas
    const aspect = gl.canvas.width / gl.canvas.height;
    //objects between 0.1 units
    const zNear = 0.1;
    //and 100 units away from the camera
    const zFar = 100;

    //Perspective projection view
    mat4.perspective(pmatrix, fieldOfView, aspect, zNear, zFar);

}

//Translate camera
function moveCamera(eye){
    if(left)
        eye[0]-=0.01;
    if(right)
        eye[0]+=0.01;
    if(up)
        eye[1]+=0.01;
    if(down)
        eye[1]-=0.01;
}


//Local transformations of shapes
function transform(translation, scaling){

    //translation
    if (right)
        translation[0] += 0.01;
    if (left)
        translation[0] -= 0.01;
    if(up)
        translation[1] += 0.01;
    if(down)
        translation[1] -= 0.01;
    if(comma)
        translation[2] += 0.01;
    if(period)
        translation[2] -= 0.01;

    //scaling
    if(xDecrease)
        scaling[0] *= 0.9;
    if(Xincrease)
        scaling[0] *= 1.1;
    if(yDecrease)
        scaling[1] *= 0.9;
    if(Yincrease)
        scaling[1] *= 1.1;
    if(zDecrease)
        scaling[2] *= 0.9;
    if(Zincrease)
        scaling[2] *= 1.1;

}

//Global transformations
var zero = false;

//Camera
var cPressed = false;

//Scaling
var xDecrease = false;
var Xincrease = false;
var yDecrease = false;
var Yincrease = false;
var zDecrease = false;
var Zincrease = false;

//Rotation
var wRotate = false; // clockwise x-axis
var sRotate = false; // counterclockwise y-axis
var eRotate = false;  // clockwise y-axis
var qRotate = false; // counterclockwise y-axis
var dRotate = false;  // clockwise z-axis
var aRotate = false; //counterclockwise z-axis

//Translation
var left = false;
var right = false;
var up = false;
var down = false;
var comma = false;
var period = false;

document.addEventListener("keydown", function (event) {

    //Camera
    if(event.key == 'c')
        cPressed = true;

    //Selection
    if(event.key == '0')
        zero = true;

    //Scaling
    if (event.key == 'x')
        xDecrease = true;
    if (event.key == 'X')
        Xincrease = true;
    if (event.key == 'y')
        yDecrease = true;
    if (event.key == 'Y')
        Yincrease = true;
    if (event.key == 'z')
        zDecrease = true;
    if (event.key == 'Z')
        Zincrease = true;

    //Rotation
    if (event.key == 'q')
        qRotate = true;
    else if (event.key == 'e')
        eRotate = true;
    if (event.key == 'w')
        wRotate = true;
    else if (event.key == 's')
        sRotate = true;
    if (event.key == 'd')
        dRotate = true;
    else if (event.key == 'a')
        aRotate = true;

    //Translation
    if (event.keyCode == 37)
        left = true;
    if (event.keyCode == 39)
        right = true;
    if (event.keyCode == 38)
        up = true;
    if (event.keyCode == 40)
        down = true;
    if(event.keyCode == 188)
        comma = true;
    if(event.keyCode == 190)
        period = true;

});

document.addEventListener("keyup", function (event) {

    //Camera
    if(event.key == 'c')
        cPressed = false;

    //Selection
    if(event.key == '0')
        zero = false;

    //Scaling
    if (event.key == 'x')
        xDecrease = false;
    if (event.key == 'X')
        Xincrease = false;
    if (event.key == 'y')
        yDecrease = false;
    if (event.key == 'Y')
        Yincrease = false;
    if (event.key == 'z')
        zDecrease = false;
    if (event.key == 'Z')
        Zincrease = false;

    //Rotation
    if (event.key == 'q')
        qRotate = false;
    else if (event.key == 'e')
        eRotate = false;
    if (event.key == 'w')
        wRotate = false;
    else if (event.key == 's')
        sRotate = false;
    if (event.key == 'd')
        dRotate = false;
    else if (event.key == 'a')
        aRotate = false;

   //Translation
    if (event.keyCode == 37)
        left = false;
    if (event.keyCode == 39)
        right = false;
    if (event.keyCode == 38)
        up = false;
    if (event.keyCode == 40)
        down = false;
    if(event.keyCode == 188)
        comma = false;
    if(event.keyCode == 190)
        period = false;

});



