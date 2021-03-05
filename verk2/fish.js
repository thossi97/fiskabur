/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Vörpunarfylki búið til í JS og sent yfir til
//     hnútalitara, sem margfaldar (þ.e. varpar)
//
//    Hjálmtýr Hafsteinsson, febrúar 2019
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices  = 36;

var NumBody = 6;
var NumTail = 3;

var bur = [];
var fiskur = [];

var colors = [];
var s = [];

var burBuffer;
var fiskBuffer;

var rotTail = 0.0;        // Snúningshorn sporðs
var incTail = 0.01;

var rotUggi1 = 0.0;     
var incUggi1 = 0.1;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY; 

var setAlign = true;

var colorLoc;
var matrixLoc;
var vPosition;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();
    fertices();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    burBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, burBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(bur), gl.STATIC_DRAW );
    
    fiskBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, fiskBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(fiskur), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation( program, "mv" );
    colorLoc = gl.getUniformLocation( program, "color" );  

    pLoc = gl.getUniformLocation( program, "projection" );
    var proj = ortho( -1.0, 1.0, -1.0, 1.0, -2.0, 2.0 );
    gl.uniformMatrix4fv(pLoc, false, flatten(proj));

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (e.offsetX - origX) ) % 360;
            spinX = ( spinX + (e.offsetY - origY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    

    render();
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
   
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        bur.push( vertices[indices[i]] );

    }
}

 // Fish vertices
function fertices(){



    var vertices = [
        // líkami (spjald)
        vec4( -0.5, -0.1, 0.0, 1.0 ),
        vec4(  0.5, -0.1, 0.0, 1.0 ),
        vec4( -0.5,  0.1, 0.0, 1.0 ),
        vec4( -0.5,  0.1, 0.0, 1.0 ),
        vec4(  0.5, -0.1, 0.0, 1.0 ),
        vec4(  0.5,  0.1, 0.0, 1.0 ),
        // sporður (þríhyrningur)
        vec4( -0.5,  0.0, 0.0, 1.0 ),
        vec4( -1.0,  0.15, 0.0, 1.0 ),
        vec4( -1.0, -0.15, 0.0, 1.0 ),
        // uggi1
        vec4( 0.02,  0.02, 0.0, 1.0 ),
        vec4( 0.0,  -0.05, 0.0, 1.0 ),
        vec4( 0.04, -0.05, 0.0, 1.0 ),
        // uggi2
        vec4( 0.02,  0.02, 0.0, 1.0 ),
        vec4( 0.0,  -0.05, 0.0, 1.0 ),
        vec4( 0.04, -0.05, 0.0, 1.0 ),
     
    ];
    
    for(var i = 0; i<vertices.length ; i++){
        fiskur.push(vertices[i]);
    }


}


function fiskabur(mv){

    gl.bindBuffer( gl.ARRAY_BUFFER, burBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 0.0, 1.0) );

    var mv1 = mat4();
    mv1 = mult( mv, translate(0.0, 1, -1.0));
    mv1 = mult( mv1, scalem(2, 0.1, 0.1));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0,  NumVertices);

    var mv2 = mat4();
    mv2 = mult( mv, translate(0.0, -1, -1.0));
    mv2 = mult( mv2, scalem(2, 0.1, 0.1));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv2));
    gl.drawArrays( gl.TRIANGLES, 0,  NumVertices);

    var mv3 = mat4();
    mv3 = mult( mv, translate(0.0, 1, 1.0));
    mv3 = mult( mv3, scalem(2, 0.1, 0.1));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv3));
    gl.drawArrays( gl.TRIANGLES, 0,  NumVertices);

    var mv4 = mat4();
    mv4 = mult( mv, translate(0.0, -1, 1.0));
    mv4 = mult( mv4, scalem(2, 0.1, 0.1));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv4));
    gl.drawArrays( gl.TRIANGLES, 0,  NumVertices);

    var mv5 = mat4();
    mv5 = mult( mv, translate(0.95, -1, 0.0));
    mv5 = mult( mv5, scalem(0.1, 0.1, 2));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv5));
    gl.drawArrays( gl.TRIANGLES, 0,  NumVertices);

    var mv6 = mat4();
    mv6 = mult( mv, translate(-0.95, -1, 0.0));
    mv6 = mult( mv6, scalem(0.1, 0.1, 2));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv6));
    gl.drawArrays( gl.TRIANGLES, 0,  NumVertices);

    var mv7 = mat4();
    mv7 = mult( mv, translate(-0.95, 1, 0.0));
    mv7 = mult( mv7, scalem(0.1, 0.1, 2));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv7));
    gl.drawArrays( gl.TRIANGLES, 0,  NumVertices);

    var mv8 = mat4();
    mv8 = mult( mv, translate(0.95, 1, 0.0));
    mv8 = mult( mv8, scalem(0.1, 0.1, 2));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv8));
    gl.drawArrays( gl.TRIANGLES, 0,  NumVertices);

    var mv9 = mat4();
    mv9 = mult( mv, translate(0.95, 0.0, 1.0));
    mv9 = mult( mv9, scalem(0.1, 2, 0.1));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv9));
    gl.drawArrays( gl.TRIANGLES, 0,  NumVertices);

    var mv10 = mat4();
    mv10 = mult( mv, translate(0.95, 0.0, -1.0));
    mv10 = mult( mv10, scalem(0.1, 2, 0.1));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv10));
    gl.drawArrays( gl.TRIANGLES, 0,  NumVertices);

    var mv11 = mat4();
    mv11 = mult( mv, translate(-0.95, 0.0, -1.0));
    mv11 = mult( mv11, scalem(0.1, 2, 0.1));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv11));
    gl.drawArrays( gl.TRIANGLES, 0,  NumVertices);

    var mv12 = mat4();
    mv12 = mult( mv, translate(-0.95, 0.0, 1.0));
    mv12 = mult( mv12, scalem(0.1, 2, 0.1));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv12));
    gl.drawArrays( gl.TRIANGLES, 0,  NumVertices);
}

//////////////
//FISH STUFF//
//////////////
function fish(mv, v){


    gl.bindBuffer( gl.ARRAY_BUFFER, fiskBuffer );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 )
    rotTail += incTail;

    if( rotTail > 3.5  || rotTail < -3.5 )
        incTail *= -1
        rotUggi1 += incUggi1;
    if( rotUggi1 > 25.5  || rotUggi1 < 0 )
        incUggi1 *= -1

	// Teikna líkama fisks (án snúnings)
	gl.uniform4fv( colorLoc, v )
    mv1 = mat4();
    mv1 = mult(mv, scalem(0.1,0.2,1.0));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumBody )

    // Teikna sporð og snúa honum
	gl.uniform4fv( colorLoc, vec4(1.0, 0.0, 0.0, 1.0) )
    var mv2 = mat4();
	mv2 = mult( mv1, translate ( -0.5, 0.0, 0.0 ) );
    mv2 = mult( mv2, rotateY( rotTail ) );
	mv2= mult( mv2, translate ( 0.5, 0.0, 0.0 ) )
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv2));
    gl.drawArrays( gl.TRIANGLES, NumBody, NumTail )
    //uggi1
    var mv3 = mat4();
	mv3 = mult( mv, translate ( -0.05, 0.0, 0.0 ) );
    mv3 = mult( mv3, rotateX( rotUggi1 ) );
	mv3= mult( mv3, translate ( 0.05, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv3));
    gl.drawArrays( gl.TRIANGLES, NumBody+NumTail, 3 )
    //uggi2
    var mv3 = mat4();
	mv3 = mult( mv, translate ( -0.05, 0.0, 0.0 ) );
    mv3 = mult( mv3, rotateX( -rotUggi1 ) );
	mv3= mult( mv3, translate ( 0.05, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv3));
    gl.drawArrays( gl.TRIANGLES, NumBody+NumTail, 3 )
 
}



// object to remember fish spawnpoints
var fishSpawn = {};
// if fish has spawned or not
var set = false;

var vel = [];

var fishMvMatrix =[];

var maxX;
var maxY; 
var maxZ;


function setFish(mv) {
        for(var i = 0; i < 20; i++){
            var mv1 = mat4();

            var x = (Math.random()*(8 - (-8)+1) + (-8))/10;
            var y = (Math.random()*(8 - (-8)+1) + (-8))/10;
            var z = (Math.random()*(8 - (-8)+1) + (-8))/10;

            mv1 = mult(mv, translate(x,y,z));

            fishSpawn[i] = {x : x, y:y, z:z};

        }
        fishMoveInit();
        maxSpeedInit();
        
        set = true;

}


function fishMoveInit(){
    for(var i = 0; i< 20; i++){
         var attX = Math.random();
         if(attX > 0.5) attX = -1;
         else attX = 1;
         
         var attY = Math.random();
         if(attY > 0.5) attY = -1;
         else attX = 1;
         var attZ = Math.random();
         if(attZ > 0.5) attZ = -1;
         else attZ = 1;

         velX = (Math.random()*(10 - 5 + 1)+5)/10000;
         velY = (Math.random()*(10- 5 + 1)+5)/10000;
         velZ = (Math.random()*(2- 0.5 + 1)+0.5)/10000;
         vel[i] = { x : velX*attX, y : velY * attY, z : velZ*attZ};
    }
    
}




function moveFish(mv) {
    for(var i = 0; i<20; i++){
        fishMvMatrix[i] = mult(mv, translate(fishSpawn[i].x,fishSpawn[i].y,fishSpawn[i].z));
        var s = align(fishSpawn[i]);
       if(setAlign === true){
          vel[i].x = s.x;
          vel[i].y = s.y;
          vel[i].z = s.z;
       }
       if(vel[i].x < 0) fishMvMatrix[i] = mult(fishMvMatrix[i], rotateY(180));
       fishSpawn[i].x+=vel[i].x;
       fishSpawn[i].y+=vel[i].y;
       fishSpawn[i].z+=vel[i].z;
      
    }
    
    fishColllision();
}



function fishColllision(){
    for(var i = 0; i < 20; i++){
        if(fishSpawn[i].x > 0.9)
            fishSpawn[i].x = -0.9;
        else if(fishSpawn[i].x < -0.9)
            fishSpawn[i].x = 0.9;

        if(fishSpawn[i].y > 0.9)
            fishSpawn[i].y = -0.9;
        else if(fishSpawn[i].y < -0.9)
            fishSpawn[i].y = 0.9;

        if(fishSpawn[i].z > 0.9)
            fishSpawn[i].z = -0.9;
        else if(fishSpawn[i].z < -0.9)
            fishSpawn[i].z = 0.9;
    }
    
}


function drawFish(mv){


    moveFish(mv);
   /* fish(fishMvMatrix[0],vec4(0.4,0.5,0.1,1.0));
    fish(fishMvMatrix[1],vec4(1.0,0.5,0.1,1.0));
    fish(fishMvMatrix[2],vec4(1.0,1.0,0.1,1.0));
    fish(fishMvMatrix[3],vec4(0.0,1.0,0.1,1.0));
    fish(fishMvMatrix[4],vec4(0.5,1.0,0.1,1.0));
    fish(fishMvMatrix[5],vec4(0.5,1.0,0.5,1.0));
    fish(fishMvMatrix[6],vec4(0.0,0.2,1.0,1.0));
    fish(fishMvMatrix[7],vec4(0.5,0.0,1.0,1.0));
    fish(fishMvMatrix[8],vec4(0.5,0.0,1.0,1.0));
    fish(fishMvMatrix[9],vec4(0.0,1.0,1.0,1.0));    */
    for(var i = 0; i <20; i++){
        fish(fishMvMatrix[i],vec4(1.0,0.5,0.1,1.0));
    }

}


function maxSpeedInit(){
        maxX = 0.003;
        maxY = 0.0007;
        maxZ = 0.0005;
        return;
    
}

///////////////////
//FISH STUFF ENDS//
///////////////////

function distance(x, y, z, sx, sy,sz){
    var a = Math.pow((sx-x),2);
    var b = Math.pow((sy-y),2);
    var c = Math.pow((sz-z),2);
   
    var dist = Math.sqrt(a+b+c);
    return dist;
}
function distance1(x,sz){
    var a = Math.pow((sz-x),2);

   
    var dist = Math.sqrt(a);
    return dist;
}
//alignment tilraun
var totalGroup = 0;

function align(f) {

    var avg ={x:0,y:0,z:0};
    var percRad = 0.8;


    for(var j = 0; j<10; j++){

        var d = distance(f.x, f.y, f.z, 
            fishSpawn[j].x, fishSpawn[j].y, fishSpawn[j].z);

             
        if(d < percRad ){
            avg.x=fishSpawn[j].x;
            avg.y=fishSpawn[j].y;
            avg.z=fishSpawn[j].z;
        
            totalGroup++;
        
        }
        
    }
   
    if(totalGroup > 0){
        avg.x/=totalGroup;
        avg.y/=totalGroup;
        avg.z/=totalGroup;

        avg.x += maxX;
        avg.y += maxY;
        avg.z += maxZ;
        

        
    }
    
    return avg;

}



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var scale = mult(mat4(), scalem(0.5,0.3,0.5));

    var mv = mat4();
    
    mv = mult( mv, scale);
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );

    if(set === false)
        setFish(mv);
   
    fiskabur(mv);
    drawFish(mv);
    
    requestAnimFrame( render );
}