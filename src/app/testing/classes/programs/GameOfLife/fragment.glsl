#define GLSLIFY 1
// #pragma glslify: snoise = require(lygia/generative/snoise)
precision mediump float;

uniform float u_time;

varying vec4 v_position; // Virtual position



float SIZE = 0.5;

void main() {
    // Get noise value between 0 and 100
    float noise = snoise(vec3(v_position.xy, u_time * 0.01 * SIZE) * 0.0025 / SIZE) * 50.0 + 50.0;
    if (mod(noise, 10.0) < 0.5)
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    else
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
/*
	This is where the results of the rules are computed.
	The reason it is computed here and not in the Image-tab
	is because we need to access the previous state of the simulation.
	This is exactly what we can do by taking the output of the buffer
	as a texture input. Therefore, when we read from render buffer A 
	in iChannel0, we can look up the state of any pixel/cell from the previous frame.
*/

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    /*
		Again, we need to access the texture using coordinates in the range [0, 1]
	*/
    vec2 uv = fragCoord.xy / iResolution.xy;
    
    /*
		Using a tempoary variable for the output value for clarity.
		it is just passed to fragColor at the end of the function.
	*/
    vec3 color = vec3(0.0);

    /*
		Time to count the population of the neighborhood!
		We count all the live cells in a 3 wide, 3 tall area
		centered on this cell.
		 _ _ _
		|_|_|_|     [-1, -1], [0, -1], [1, -1],
		|_|_|_|  =  [-1,  0], [0,  0], [1,  0],
		|_|_|_|     [-1,  1], [0,  1], [1,  1],

		Since each cell only should hold a value of either 0 (dead) or 1 (alive),
		the count yields an integer value, but since the
		texture sampling returns a float, we will use that instead.
	*/ 
    float neighbors = 0.0;
    
    for(float i = -1.0; i <= 1.0; i += 1.0)
    {
        for( float j = -1.0; j <= 1.0; j += 1.0)
        {
        	vec2 offset = vec2(i, j) / iResolution.xy;		 // Scale the offset down
        	vec4 lookup = texture(iChannel0, uv + offset); // Apply offset and sample
        	neighbors += lookup.x;							 // Accumulate the result
        }
    }

    
    /*
		This samples the pixel/cell in the previous frame. We use this along with the
		neighbor count to determined whether the cell is alive or dead in this
		iteration.
		Note that we have now redundantly sampled this pixel twice (in the double for loop also!).
		This is just for simplicity. If you wish, you can try to make the code more efficient :)
	*/    
    float cell = texture(iChannel0, uv).x;
    
    
    /*
		Now we just need to apply the rules to calulate the state of the cell in this iteraton.
		It's really simple: We have already initialized the cell of this iteration to 0,
		We therefore just have to check if we need to change that by seeing whether the
		conditions for being alive hold:
		Cell alive and exactly 2 or 3 _other_ neighbors (3 or 4 in total)
		OR
		Cell dead and exactly 2 _other_ neighbors (3 in total)
	*/
    if(cell > 0.0) {
        if(neighbors >= 3.0 && neighbors <= 4.0) {
            color = vec3(1.0);
        }
    } else if(neighbors > 2.0 && neighbors < 4.0) {
    	color = vec3(1.0);
    }

    /*
		In order to get any interesting behaviour, we need a non-uniform
		starting-conditions. One simple way to do this is to feed
		a noise texture into the buffer for the first frame.
		When the condition fails, the previous frame will hold the noise texture ( iChannel1 ),
		and the Game of Life can begin!
	*/
    if(iTime < 1.0) { // can also use iFrame == 0, but seems less reliable.
        color = vec3(texture(iChannel1, fragCoord.xy / iResolution.xx).x);
    }
    
    gl_FragColor = vec4(color, 1.0);
}