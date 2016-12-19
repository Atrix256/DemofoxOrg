/*==================================================

Created by Alan Wolfe
jsraytrace{at}demofox.org
http://demofox.org

October 2011

==================================================*/

//the width and height of the "texture" that holds our raytracing result
var g_rayTraceWidth = 290.0;
var g_rayTraceHeight = 290.0;

//the "screen rect" dimensions
var g_screenRectWidth = 8;
var g_screenRectHeight = 8;

//how far the camera is from the "screen rect"
var g_cameraPos = [0,2,-10];
var g_screenRectZ = -5;

//the size of grid cells in the scene graph
var g_sceneGraphGridSize = 20.0;

//calculated stuff

//other globals
var g_scene1;
var g_scene2;
var g_imageData;
var g_camera;
var g_rowToRender = 0; //used to only render 1 row at a time when the camera is dirtied to help empty cache rendering times and browser responsiveness

//metrics
var g_rayCount = 0;

//engine settings
var g_interlacedMode = true;
var g_pixelCaching = false;
var g_rayCaching = true;
var g_shadingOn = true;
var g_orthoMode = false;
var g_shadowsOn = true;
var g_reflectionsOn = true;
var g_blackAndWhite = false;
var g_redBlue3d = false;
var g_maxRayBounce = 3;

//application settings
var g_pulseMode = false;
var g_animateObjectsMode = false;
var g_animateCameraMode = false;

//objects we care about
var g_scene1_pulseLight1;
var g_scene1_pulseLight2;
var g_scene1_PulseSphere1;
var g_scene1_PulseSphere2;

var g_scene2_pulseLight1;
var g_scene2_pulseLight2;

function populateScene1()
{
  var prim;

  g_scene1 = new Scene(g_sceneGraphGridSize)

  //ground quad made up of 2 triangles
  var pointA = [-500,-4, 500];
  var pointB = [ 500,-4, 500];
  var pointC = [ 500,-4,-500];
  var pointD = [-500,-4,-500];

  prim = g_scene1.addTriangle(pointA,pointB,pointC);
  prim.setReflection(0);
  prim.setDiffuse(1);
  prim.setColor(0.4,0.3,0.9);
  prim = g_scene1.addTriangle(pointA,pointC,pointD);
  prim.setReflection(0);
  prim.setDiffuse(1);
  prim.setColor(0.4,0.9,0.3);

  //spheres
  prim = g_scene1.addSphere([1, -0.8, 3], 2.5);
  prim.setReflection(0.6);
  prim.setColor(178/255,178/255,178/255);
  g_scene1_PulseSphere1 = prim;

  prim = g_scene1.addSphere([-5.5, -0.5, 7], 2);
  prim.setReflection(1);
  prim.setDiffuse(0.1);
  prim.setColor(178/255,178/255,255/255);
  g_scene1_PulseSphere2 = prim;

  //lights
  prim = g_scene1.addSphere([0,5,5], 0.1);
  prim.setColor(153/255,153/255,153/255);
  prim.setIsLight(true);
  g_scene1_pulseLight1 = prim;

  prim = g_scene1.addSphere([2,5,1], 0.1);
  prim.setColor(178/255,178/255,229/255);
  prim.setIsLight(true);
  g_scene1_pulseLight2 = prim;  

  //alert("1: " + prim.m_ID);
}

function populateScene2()
{
  var prim;

  g_scene2 = new Scene(g_sceneGraphGridSize)

  //ground quad made up of 2 triangles
  var pointA = [-500,-4, 500];
  var pointB = [ 500,-4, 500];
  var pointC = [ 500,-4,-500];
  var pointD = [-500,-4,-500];
  prim = g_scene2.addTriangle(pointA,pointB,pointC);
  prim.setReflection(0);
  prim.setDiffuse(1);
  prim.setColor(0.4,0.3,0.9);
  prim = g_scene2.addTriangle(pointA,pointC,pointD);
  prim.setReflection(0);
  prim.setDiffuse(1);
  prim.setColor(0.4,0.9,0.3);
    
  //blue sphere
  prim = g_scene2.addSphere([-4, -2, 3], 2);
  prim.setReflection(0.5);
  prim.setDiffuse(0.2);
  prim.setColor(0.3,0.3,0.9);

  //yellow sphere
  prim = g_scene2.addSphere([6, -2, 3], 2);
  prim.setReflection(0.5);
  prim.setDiffuse(0.2);
  prim.setColor(0.9,0.9,0.3);  

  //green sphere
  prim = g_scene2.addSphere([0, -2, 0], 2);
  prim.setReflection(0.5);
  prim.setDiffuse(0.2);
  prim.setColor(0.3,0.9,0.3);  

  //red sphere
  prim = g_scene2.addSphere([1.5, -2, -6], 2);
  prim.setReflection(0.5);
  prim.setDiffuse(0.2);
  prim.setColor(0.9,0.3,0.3); 
  
  //magenta sphere
  prim = g_scene2.addSphere([-12, -2, 10], 2);
  prim.setReflection(0.5);
  prim.setDiffuse(0.2);
  prim.setColor(0.9,0.3,0.9);    

  //teal sphere
  prim = g_scene2.addSphere([4, 5, 10], 2);
  prim.setReflection(0.5);
  prim.setDiffuse(0.2);
  prim.setColor(0.3,0.9,0.9);      

  //reflective back quad
  var pointA = [-500, 500, 41];
  var pointB = [ 500, 500, 41];
  var pointC = [ 500,-500, 41];
  var pointD = [-500,-500, 41];
  prim = g_scene2.addTriangle(pointA,pointB,pointC);
  prim.setReflection(1);
  prim.setDiffuse(0)
  prim.setDiffuseColor(1,1,1);    
  prim.setSpecularColor(0,0,0);  
  prim = g_scene2.addTriangle(pointA,pointC,pointD);
  prim.setReflection(1);
  prim.setDiffuse(0)
  prim.setDiffuseColor(1,1,1);    
  prim.setSpecularColor(0,0,0);  

/*
  //reflective back plane
  planeNormal = [0,0,-1];
  Vector3_normalize(planeNormal);
  prim = g_scene2.addPlane(planeNormal, 40);
  prim.setReflection(1);
  prim.setDiffuse(0);
  prim.setDiffuseColor(1,1,1);    
  prim.setSpecularColor(0,0,0);  
*/

  //lights
  prim = g_scene2.addSphere([0,5,5], 0.1);
  prim.setColor(153/255,153/255,153/255);
  prim.setIsLight(true);
  g_scene2_pulseLight1 = prim;

  prim = g_scene2.addSphere([2,5,1], 0.1);
  prim.setColor(178/255,178/255,229/255);
  prim.setIsLight(true);
  g_scene2_pulseLight2 = prim;

  //alert("2: " + prim.m_ID);
}

function UpdateRPSDisplay()
{
  //update our fps text if we can
  var RPSText = document.getElementById('RPSText');
  if(RPSText)
  {
    //calculate frame count, set text, and reset the frame count
    var rps = g_rayCount / 2;
    RPSText.innerHTML = "RPS: " + rps;

    if(g_rowToRender < g_rayTraceHeight)
      RPSText.innerHTML = "RPS: " + rps + "  (" + (100 * g_rowToRender / g_rayTraceHeight).toPrecision(3) + "% Loaded)";
    else
      RPSText.innerHTML = "RPS: " + rps;

    g_rayCount = 0;

    //set the time for when we should next update the display
    setTimeout("UpdateRPSDisplay()",2000);      
  }
}

function SetMaxBounces(bounces)
{
  g_maxRayBounce = bounces;
}

function ToggleRedBlue3d()
{
  g_redBlue3d = !g_redBlue3d;
  g_camera.setRedBlue3d(g_redBlue3d);
}

function ToggleBlackAndWhite()
{
  g_blackAndWhite = !g_blackAndWhite;
}

function ToggleShadows()
{
  g_shadowsOn = !g_shadowsOn;

  //how shadows are calculated, combined with ray caching, when shadows are toggled, the cache needs to be cleared so it doesnt hold data from the previous state
  g_camera.setDirty();
}

function ToggleReflections()
{
  g_reflectionsOn = !g_reflectionsOn;
}

function ToggleInterlacedMode()
{
  g_interlacedMode = !g_interlacedMode;
}

function TogglePixelCaching()
{
  g_pixelCaching = !g_pixelCaching;
}

function ToggleOrthoMode()
{
  g_orthoMode = !g_orthoMode;
  g_camera.setOrthoMode(g_orthoMode);

  if(g_orthoMode)
  {
    g_camera.setViewRectSize(g_screenRectWidth * 2,g_screenRectHeight * 2);
  }
  else
  {
    g_camera.setViewRectSize(g_screenRectWidth,g_screenRectHeight);
  }
}

function ToggleRayCaching()
{
  g_rayCaching = !g_rayCaching;
}

function ToggleShading()
{
  g_shadingOn = !g_shadingOn;
}

function ToggleLightPulseMode()
{
  g_pulseMode = !g_pulseMode;

  //restore the light color if we are leaving pulse mode
  if(!g_pulseMode)
  {
    g_scene1_pulseLight1.setColor(153/255,153/255,153/255);
    g_scene1_pulseLight2.setColor(178/255,178/255,229/255);
    g_scene2_pulseLight1.setColor(153/255,153/255,153/255);
    g_scene2_pulseLight2.setColor(178/255,178/255,229/255);    
  }
}

function ToggleAnimateObjectsMode()
{
  g_animateObjectsMode = !g_animateObjectsMode;

  //restore the light color if we are leaving pulse mode
  if(!g_animateObjectsMode)
  {
    g_scene1_PulseSphere1.m_p = [1, -0.8, 3];
    g_scene1_PulseSphere2.setDiffuse(0.1);
  }
}

function SetScene(sceneIndex)
{
  if(sceneIndex == 1)
    g_camera.setScene(g_scene1);
  if(sceneIndex == 2)
    g_camera.setScene(g_scene2);
  //by default just go to the first scene
  else
    g_camera.setScene(g_scene1);
}

function SetResolution(width,height)
{
  //store off the new resolution, adding a little border on the edge
  g_rayTraceWidth = width - 10;
  g_rayTraceHeight = height - 10;

  //tell the camera the new resolution
  g_camera.setResolution(g_rayTraceWidth,g_rayTraceHeight);

  var sizeFactor = 1;
  if(g_orthoMode)
    sizeFactor = 2;

  //handle different aspect ratio resolutions
  g_camera.setViewRectSize(g_screenRectWidth * (width / height) * sizeFactor,g_screenRectHeight * sizeFactor);

  //set our canvas to the new size
  g_elem.width = width;
  g_elem.height = height;
  g_elem.style.width = width + "px";
  g_elem.style.height = height + "px";

  //recreate our image data buffer
  makeImageDataBuffer();
}

function ToggleAnimateCameraMode()
{
  g_animateCameraMode = !g_animateCameraMode;

  //restore the camera if we are leaving pulse mode
  if(!g_animateCameraMode)
  {
    g_camera.lookAt([g_cameraPos[0],g_cameraPos[1],g_cameraPos[2]], //eye
                    [g_cameraPos[0],g_cameraPos[1],g_screenRectZ], //target
                    [0,1,0]); //up
  }
}

function init()
{
  //create the scenes
  populateScene1();
  populateScene2();

  //alert(g_scene1.m_scenegraph.m_primitiveList);
  //alert(g_scene2.m_scenegraph.m_primitiveList);

  //create the camera looking at that scene
  g_camera = new Camera(g_scene1,
                        [g_cameraPos[0],g_cameraPos[1],g_cameraPos[2]], //eye
                        [g_cameraPos[0],g_cameraPos[1],g_screenRectZ], //target
                        [0,1,0], //up
                        g_rayTraceWidth, //pixel width
                        g_rayTraceHeight, //pixel height
                        g_screenRectWidth, //view rect width
                        g_screenRectHeight);//view rect height

  //add the metrics displays
  var MainHTML = document.getElementById('MainHTML');
  if(MainHTML)
  {
    var newTable;
    var newTr;
    var newTd;
    var newDiv;
    var newInput;
    var newText;

    newDiv = document.createElement('div');
    newDiv.setAttribute('ID', 'RPSText');
    MainHTML.appendChild(newDiv);    

    MainHTML.appendChild(document.createElement('br'));    

    newTable = document.createElement('table');
    newTable.style.border = "1px solid";
    newTable.style.borderCollapse = "collapse";    
    MainHTML.appendChild(newTable);
      newTr = document.createElement('tr');
      newTr.style.fontWeight = 700;
      newTr.style.textDecoration = "underline";
      newTr.style.backgroundColor ='#002000'      
      newTable.appendChild(newTr);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Optimizations");
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Features");
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Other");
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Max Ray Bounces");
          newTd.appendChild(newText);              
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Resolution");
          newTd.appendChild(newText);              
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Scene");
          newTd.appendChild(newText);              
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);       
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('checked', 'true');
          newInput.setAttribute('onClick', 'ToggleInterlacedMode()');
          newText = document.createTextNode("Interlaced Mode");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('onClick', 'ToggleShading()');
          newInput.setAttribute('checked', 'true');
          newText = document.createTextNode("Phong Shading");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('onClick', 'ToggleLightPulseMode()');
          newText = document.createTextNode("Animate Lighting");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'maxBounces');
          newInput.setAttribute('onClick', 'SetMaxBounces(1);');
          newText = document.createTextNode("1");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('onClick', 'SetResolution(100,100);');
          newText = document.createTextNode("100x100");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'scene');
          newInput.setAttribute('checked', 'true');
          newInput.setAttribute('onClick', 'SetScene(1);');
          newText = document.createTextNode("Simple Spheres");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);          
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('checked', 'true');
          newInput.setAttribute('onClick', 'ToggleRayCaching()');
          newText = document.createTextNode("Ray Caching (work in progress)");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('checked', 'true');          
          newInput.setAttribute('onClick', 'ToggleShadows()');
          newText = document.createTextNode("Shadows");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('onClick', 'ToggleAnimateObjectsMode()');
          newText = document.createTextNode("Animate Objects");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);  
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'maxBounces');
          newInput.setAttribute('onClick', 'SetMaxBounces(2);');
          newText = document.createTextNode("2");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);          
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('onClick', 'SetResolution(200,200);');
          newText = document.createTextNode("200x200");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'scene');
          newInput.setAttribute('onClick', 'SetScene(2);');
          newText = document.createTextNode("Colored Spheres");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);                  
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);         
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('onClick', 'TogglePixelCaching()');
          newText = document.createTextNode("Pixel Caching (not yet implemented)");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('checked', 'true');          
          newInput.setAttribute('onClick', 'ToggleReflections()');
          newText = document.createTextNode("Reflections");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('onClick', 'ToggleAnimateCameraMode()');
          newText = document.createTextNode("Animate Camera");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);  
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'maxBounces');
          newInput.setAttribute('checked', 'true');
          newInput.setAttribute('onClick', 'SetMaxBounces(3);');
          newText = document.createTextNode("3");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);          
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('checked', 'true');          
          newInput.setAttribute('onClick', 'SetResolution(300,300);');
          newText = document.createTextNode("300x300");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
        //empty cell                  
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('onClick', 'ToggleOrthoMode()');
          newText = document.createTextNode("Orthographic Projection");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'maxBounces');
          newInput.setAttribute('onClick', 'SetMaxBounces(5);');
          newText = document.createTextNode("5");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);          
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('onClick', 'SetResolution(400,400);');
          newText = document.createTextNode("400x400");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);             
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell                   
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('onClick', 'ToggleBlackAndWhite()');
          newText = document.createTextNode("Black and white");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'maxBounces');
          newInput.setAttribute('onClick', 'SetMaxBounces(10);');
          newText = document.createTextNode("10");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);          
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('onClick', 'SetResolution(500,500);');
          newText = document.createTextNode("500x500");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
        //empty cell                  
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('onClick', 'ToggleRedBlue3d()');
          newText = document.createTextNode("Red/Blue 3d");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('onClick', 'SetResolution(800,600);');
          newText = document.createTextNode("800x600");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);   
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell                   
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('onClick', 'SetResolution(1024,768);');
          newText = document.createTextNode("1024x768");
          newTd.appendChild(newInput);
          newTd.appendChild(newText); 
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //empty cell                                             
  }  

  //kick off the appropriate metrics displays
  UpdateRPSDisplay();

  //make our image data buffer
  makeImageDataBuffer();  

  //all is well
  return true;
}

function makeImageDataBuffer()
{
  //make our image data buffer
  if (g_context.createImageData)
  {
    g_imageData = g_context.createImageData(g_rayTraceWidth, g_rayTraceHeight);
  }
  else if (g_context.getImageData)
  {
    g_imageData = g_context.getImageData(0, 0, g_rayTraceWidth, g_rayTraceHeight);
  }
  else
  {
    g_imageData = {'width' : g_rayTraceWidth, 'height' : g_rayTraceHeight, 'data' : new Array(g_rayTraceWidth*g_rayTraceHeight*4)};
  }  

  //fill the context with green to start out
  g_context.fillStyle   = "#00FF20";
  g_context.fillRect(0, 0, g_elem.offsetWidth, g_elem.offsetHeight);
}

function drawPixels()
{
  //for each pixel
  var pix = g_imageData.data;
  var pixelIndex = 0;
  var rayIndex = 0;
  var indexy = 0;

  //don't use interlaced mode when doing the "loading" render pass
  var useInterlacedMode = g_interlacedMode && (g_rowToRender >= g_rayTraceHeight);

  //if we are in interlaced mode and on an odd numbered frame, start at line 1 insetad of 0
  if(useInterlacedMode && g_currentFrame%2 == 1)
  {
    pixelIndex += g_rayTraceWidth * 4;
    rayIndex += g_rayTraceWidth;
    indexy = 1;
  }

  //if we are supposed to render a specific row, skip to it
  if(g_rowToRender < g_rayTraceHeight)
  {
    pixelIndex = g_rowToRender * g_rayTraceWidth * 4;
    rayIndex = g_rowToRender * g_rayTraceWidth;
    indexy = g_rowToRender;
  }

  //loop through all the rows
  for(; (indexy < g_rayTraceHeight && indexy <= g_rowToRender); indexy++)
  {
    //simulate best case scenario of pixel caching - do nothing for each row
    if(g_pixelCaching)
    {
        //advance the pixels
        pixelIndex += g_rayTraceWidth * 4;

        //advance the rays
        rayIndex += g_rayTraceWidth;
    }
    else
    {
      //loop through all the columns
      for(var indexx = 0; indexx < g_rayTraceWidth; indexx++)
      {
        //ask our camera for the color of this ray
        var rayColor = g_camera.getColorForRay(rayIndex, g_maxRayBounce,g_shadingOn,g_reflectionsOn,g_shadowsOn);

        if(rayColor[0] > 1)
          rayColor[0] = 1;

        if(rayColor[1] > 1)
          rayColor[1] = 1;

        if(rayColor[2] > 1)
          rayColor[2] = 1;

        if(g_blackAndWhite)
        {
          var average = (rayColor[0] + rayColor[1] + rayColor[2])/3;
          rayColor[0] = average;
          rayColor[1] = average;
          rayColor[2] = average;
        }

        //set a color
        pix[pixelIndex  ] = rayColor[0] * 255; // the red channel
        pix[pixelIndex+1] = rayColor[1] * 255; // the red channel
        pix[pixelIndex+2] = rayColor[2] * 255; // the red channel
        pix[pixelIndex+3] = 255;         // the alpha channel
            
        //move to the next pixel
        pixelIndex += 4;

        //move to the next ray
        rayIndex++;

        //increment how many rays have been calculated
        g_rayCount++;
      }
    }

    //if we are in interlaced mode, skip an extra line
    if(useInterlacedMode)
    {
      pixelIndex += g_rayTraceWidth * 4;
      rayIndex += g_rayTraceWidth;
      indexy++;
    }
  }

  if( g_rowToRender < g_rayTraceHeight )
  {
    g_rowToRender++;
  }

  // Draw the ImageData object.
  g_context.putImageData(g_imageData, 5, 5);
}

function animateScene()
{
  if(g_pulseMode)
  {
    var phase = (g_currentMS * 0.005) % (2 * Math.PI);
    var color = (Math.sin(phase) + 1) * 127.5;
    g_scene1_pulseLight1.setColor(255/255,color/255,color/255);
    g_scene2_pulseLight1.setColor(255/255,color/255,color/255);

    phase = (g_currentMS * 0.0085) % (2 * Math.PI);
    color = (Math.sin(phase) + 1) * 127.5;    
    g_scene1_pulseLight2.setColor(color/255,255/255,color/255);
    g_scene2_pulseLight2.setColor(color/255,255/255,color/255);
  }

  if(g_animateObjectsMode)
  {
    var phase = (g_currentMS * 0.001) % (2 * Math.PI);
    g_scene1_PulseSphere1.m_p = [Math.sin(phase) * 10, -0.8, 3];

    phase = (g_currentMS * 0.003) % (2 * Math.PI);
    g_scene1_PulseSphere2.setDiffuse((Math.sin(phase)+1)/2);
  }

  if(g_animateCameraMode)
  {
    var phase = (g_currentMS * 0.001) % (2 * Math.PI);
    var xpos = Math.sin(phase) * 5;
    var zpos = Math.cos(phase) * 5;

    g_camera.lookAt([xpos,g_cameraPos[1],g_screenRectZ+zpos], //eye
                    [g_cameraPos[0],g_cameraPos[1],g_screenRectZ], //target
                    [0,1,0]); //up    
  }
}

function update()
{
  //if we shouldn't use ray caching, mark the camera as dirty so it clears it's cache
  if(!g_rayCaching)
    g_camera.setDirty();  
  //else if we are using caching and the cache is empty, start rendering in a special loading rendering mode
  else if(g_camera.isDirty())
    g_rowToRender = 0;

  //update our camera
  g_camera.update();

  //animate the scene
  animateScene();

  //render
  drawPixels();
}