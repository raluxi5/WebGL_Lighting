
//Matrices for viewing
var mMatrix;
var pmatrix;
var viewMatrix;
var normalMatrix;
var viewmodel;
var projviewmodel;

//Uniform Locations, matrices locations
var viewmodelLoc, projviewmodelLoc, normalMLoc;
//Light uniforms locations
var ambientLoc, diffuseLoc, specularLoc, lightPositionLoc, shinyLoc;

//Treating the .obj model like a usual shape
//Set the shape ready to be drawn
function createOBJShape(gl,program,text, translation, scaling, rotatex, rotatey, rotatez,eye, target) {

     var localProgram = program;

     //Model data from obj file
     parseOBJFile(text);

     var vertices = ObjData.objVertices;

     var normals = ObjData.objNormals;

     var faces = ObjData.objFaces;


     //Buffers
     var vBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

     var nBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);


     //Attributes
     var vPosition = gl.getAttribLocation(localProgram, "vPosition");
     var vNormal = gl.getAttribLocation(localProgram,"vNormal");
     gl.enableVertexAttribArray(vPosition);
     gl.enableVertexAttribArray(vNormal);


     //Uniform Locations
     getMatricesUniformsLoc(gl,localProgram);

     //Matrices from viewing initialization
     mMatrix = mat4.create();
     pmatrix = mat4.create();
     viewMatrix = mat4.create();
     normalMatrix = mat3.create();
     viewmodel = mat4.create();
     projviewmodel = mat4.create();


     gl.useProgram(localProgram);


    this.renderShape = function () {

        //Projection on plane
        perspective(pmatrix);

        //Initial transformations
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, mMatrix, translation);
        mat4.scale(mMatrix, mMatrix, scaling);

        mat4.rotateX(mMatrix, mMatrix, rotatex);
        mat4.rotateY(mMatrix, mMatrix, rotatey);
        mat4.rotateZ(mMatrix, mMatrix, rotatez);

        //GLOBAL transformations
        if(zero) {
            mat4.identity(mMatrix);
            mat4.rotateX(mMatrix, mMatrix, rotatex);
            mat4.rotateY(mMatrix, mMatrix, rotatey);
            mat4.rotateZ(mMatrix, mMatrix, rotatez);
            mat4.translate(mMatrix, mMatrix, translation);
            mat4.scale(mMatrix, mMatrix, scaling);
        }

        //Looking from positive z-axis at center
        mat4.lookAt(viewMatrix, eye, target, [0, 1, 0]);

        //combined matrix of model view and projection matrices to set the coordinates
        mat4.multiply(viewmodel, viewMatrix, mMatrix);
        mat4.multiply(projviewmodel, pmatrix, viewmodel);

        //Light translation according to global coordinates
        //Light doesn't move when the object is being transformed
        mat3.normalFromMat4(normalMatrix, viewmodel);

        //send to GPU
        //Matrices for viewing
        gl.uniformMatrix3fv(normalMLoc, false, normalMatrix);
        gl.uniformMatrix4fv(viewmodelLoc, false, viewmodel);
        gl.uniformMatrix4fv(projviewmodelLoc, false, projviewmodel);

        //Light
        gl.uniform4fv(ambientLoc, Iambient);
        gl.uniform4fv(diffuseLoc, Idiffuse);
        gl.uniform4fv(specularLoc, Ispecular);
        gl.uniform4fv(lightPositionLoc, lightPosition);
        gl.uniform1f(shinyLoc, materialShininess);

        //bind buffers for drawing with current program
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);


        //draw shape
        gl.drawArrays(gl.TRIANGLES, 0, faces.length / 2);

    };

    this.transformations = function (){

        //rotation
        if (wRotate)
            rotatex += 0.1;
        if (sRotate)
            rotatex -= 0.1;
        if (eRotate)
            rotatey += 0.1;
        if (qRotate)
            rotatey -= 0.1;
        if (dRotate)
            rotatez += 0.1;
        if (aRotate)
            rotatez -= 0.1;

        //translation, scaling
        transform(translation, scaling);

    };


}


function getMatricesUniformsLoc(gl,program){

    //Uniforms location from shaders, matrices for viewing
     normalMLoc = gl.getUniformLocation(program, "normalMatrix");
     viewmodelLoc = gl.getUniformLocation(program,"modelViewMatrix");
     projviewmodelLoc = gl.getUniformLocation(program,"modelviewprojMatrix");
     ambientLoc = gl.getUniformLocation(program, "Iambient");
     diffuseLoc = gl.getUniformLocation(program,"Idiffuse");
     specularLoc = gl.getUniformLocation(program,"Ispecular");
     shinyLoc = gl.getUniformLocation(program, "shiny");
     lightPositionLoc = gl.getUniformLocation(program,"lightPosition");

}

function parseOBJFile(text) {

    //temporary model vertices
    let verticesTemp = [0];
    //temporary model normals
    let normalsTemp = [0];

    //faces indices from the obj file
    var faces = [];

    //final vertices and normals for a model
    var vertices = [];
    var normals = [];

    //take each line
    var lines = text.trim().split("\n");

    for (let l= 0; l < lines.length; l++) {
        var line = lines[l];

        //ignore blank lines
        if (line.startsWith(' ') || line.startsWith('#') || line.startsWith('o')) {
            continue;
        }

        //line split into an array
        var elements = line.split(" ");
        //first element is the letter which indicates what data type is there
        switch (elements[0]) {
            //vertices
            case 'v': {
                for (let i = 1; i < elements.length; i++) {
                    verticesTemp.push(parseFloat(elements[i]));
                }

                break;
            }
            //normals
            case 'vn': {
                for (var i = 1; i < elements.length; i++) {
                    normalsTemp.push(parseFloat(elements[i]));
                }
                break;
            }
            //faces ex.1//1 33//2 2//3 (w normals)
            case 'f': {
                //add vertices and normals to faces
                // v//vn v//vn v//vn
                for (let i = 1; i < elements.length; i++) { //goes on the line
                    let ind = elements[i].split("/");
                    //ind[0] is v ; ind[2] is vn
                    faces.push(parseFloat(ind[0]), parseFloat(ind[2]));
                }
                break;
            }
        }

    }

    //create the model geometry to be passed to the buffers
    //first element of faces is the vertex position value
    for(let i = 0; i < faces.length; i+=2){
        vertices.push(verticesTemp[3 * faces[i]-2]);//x
        vertices.push(verticesTemp[3 * faces[i]-1]);//y
        vertices.push(verticesTemp[3 * faces[i]-0]);//z
    }
    //second element of faces is the normal position value
    for (let i = 1; i < faces.length; i+=2){
        normals.push(normalsTemp[3 * faces[i]-2]);//x
        normals.push(normalsTemp[3 * faces[i]-1]);//y
        normals.push(normalsTemp[3 * faces[i]-0]);//z
    }

    return ObjData = {
      objVertices : vertices,
      objNormals : normals,
      objFaces : faces
    };


}
