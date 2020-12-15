
//function to initiate, load, bind the 2 shaders
function shaders( gl, vertexShaderId, fragmentShaderId )
{

    var vertexShader;
    var fragmentShader;

    //identifiers from .html file for vertex, fragment shader
    var vertexElem = document.getElementById( vertexShaderId );
    if ( !vertexElem ) {
        alert( "Unable to load vertex shader " + vertexShaderId );
        return -1;
    }
    else {
        vertexShader = gl.createShader( gl.VERTEX_SHADER );
        gl.shaderSource( vertexShader, vertexElem.text );
        gl.compileShader( vertexShader );
    }

    var fragmentElem = document.getElementById( fragmentShaderId );
    if ( !fragmentElem ) {
        alert( "Unable to load vertex shader " + fragmentShaderId );
        return -1;
    }
    else {
        fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
        gl.shaderSource( fragmentShader, fragmentElem.text );
        gl.compileShader( fragmentShader );
    }

    //link object with shaders
    var program = gl.createProgram();
    gl.attachShader( program, vertexShader );
    gl.attachShader( program, fragmentShader );
    gl.linkProgram( program );

    return program;

}
