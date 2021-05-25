/*
 *
 * VectorHelper.js
 * Contains utility functionality for basic hierarchy support.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/utils/VectorHelper.js",
		_VectorHelper = {},
		_MathHelper,
		utilVec31Rotated,
		utilVec31Axis,
		utilVec31DistanceTo,
		utilVec31VectorTo,
		utilVec31NormalTo,
		utilVec31LinePoint,
		utilVec32LinePoint,
		utilVec33LinePoint,
		utilQ1Axis,
		utilQ1Relative,
		utilMat41Relative;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _VectorHelper,
		requirements: [
			"js/kaiopua/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( mh ) {
		
		_MathHelper = mh;
		
		// utility
		
		utilVec31Rotated = new THREE.Vector3();
		utilVec31Axis = new THREE.Vector3();
		utilVec31DistanceTo = new THREE.Vector3();
		utilVec31VectorTo = new THREE.Vector3();
		utilVec31NormalTo = new THREE.Vector3();
		utilVec31LinePoint = new THREE.Vector3();
		utilVec32LinePoint = new THREE.Vector3();
		utilVec33LinePoint = new THREE.Vector3();
		utilQ1Axis = new THREE.Quaternion();
		utilQ1Relative= new THREE.Quaternion();
		utilMat41Relative = new THREE.Matrix4();
		
		// functions
		
		_VectorHelper.clamp = clamp;
		_VectorHelper.clamp_scalar = clamp_scalar;
		_VectorHelper.clamp_length = clamp_length;
		_VectorHelper.different = different;
		_VectorHelper.distance_between = distance_between;
		_VectorHelper.distance_sq_between = distance_sq_between;
		_VectorHelper.vector_between = vector_between;
		_VectorHelper.normal_between = normal_between;
		_VectorHelper.closest_point_on_line_to_point = closest_point_on_line_to_point;
		_VectorHelper.degree_to_rad = degree_to_rad;
		_VectorHelper.rotate_relative_to = rotate_relative_to;
		_VectorHelper.retrieve_relative_to = retrieve_relative_to;
		_VectorHelper.angle_between_vectors = angle_between_vectors;
		_VectorHelper.signed_angle_between_coplanar_vectors = signed_angle_between_coplanar_vectors;
		_VectorHelper.axis_between_vectors = axis_between_vectors;
		_VectorHelper.angle_from_q = angle_from_q;
		_VectorHelper.q_to_axis = q_to_axis;
		_VectorHelper.get_orthonormal_vectors = get_orthonormal_vectors;
		_VectorHelper.get_rotation_to_normal = get_rotation_to_normal;
		_VectorHelper.lerp = lerp;
		_VectorHelper.lerp_normalized = lerp_normalized;
		_VectorHelper.lerp_snap = lerp_snap;
		
	}
	
	/*===================================================
    
    misc
    
    =====================================================*/
	
	function clamp ( v, vmin, vmax ) {
		
		v.x = _MathHelper.clamp( v.x, vmin.x, vmax.x );
		v.y = _MathHelper.clamp( v.y, vmin.y, vmax.y );
		v.z = _MathHelper.clamp( v.z, vmin.z, vmax.z );
		
		return v;
		
	}
	
	function clamp_scalar ( v, scalarMin, scalarMax ) {
		
		v.x = _MathHelper.clamp( v.x, scalarMin, scalarMax );
		v.y = _MathHelper.clamp( v.y, scalarMin, scalarMax );
		v.z = _MathHelper.clamp( v.z, scalarMin, scalarMax );
		
		return v;
		
	}
	
	function clamp_length ( v, lengthMax ) {
		
		var length = v.length(),
			scalar;
		
		if ( length > lengthMax ) {
			
			scalar = lengthMax / length;
			
			v.multiplyScalar( scalar );
			
		}
		
		return v;
		
	}
	
	function different ( va, vb ) {
		
		if ( va.x !== vb.x || va.y !== vb.y || va.z !== vb.z || va.w !== vb.w ) {
			return true;
		}
		
		return false;
		
	}
	
	/*===================================================
    
    distance
    
    =====================================================*/
	
	function distance_between ( vecFrom, vecTo ) {
		
		return Math.sqrt( utilVec31DistanceTo.sub( vecTo, vecFrom ).lengthSq() );
		
	}
	
	function distance_sq_between ( vecFrom, vecTo ) {
		
		return utilVec31DistanceTo.sub( vecTo, vecFrom ).lengthSq();
		
	}
	
	function vector_between ( vecFrom, vecTo ) {
		
		return utilVec31VectorTo.sub( vecTo, vecFrom );
		
	}
	
	function normal_between ( vecFrom, vecTo ) {
		
		return utilVec31NormalTo.sub( vecTo, vecFrom ).normalize();
		
	}
	
	function closest_point_on_line_to_point ( point, origin, direction, length ) {
		
		var dot,
			dotClamped,
			originToPoint = utilVec31LinePoint.sub( this.position, origin ),
			directionMagnitude = utilVec32LinePoint.copy( direction ).normalize(),
			pointClosest = utilVec33LinePoint;

		dot = originToPoint.dot( direction );

		// if line segment

		if( main.is_number( length ) && length > 0 ) {

			dotClamped = _MathHelper.clamp( dot / length, 0, 1 );

		}
		// else infinite ray
		else {

			length = 1;
			dotClamped = Math.max( 0, dot );

		}

		pointClosest.add( origin, directionMagnitude.multiplyScalar( dotClamped * length ) );

		return pointClosest;

	}
	
	/*===================================================
    
    rotation
    
    =====================================================*/
	
	function degree_to_rad ( v ) {
		
		v.x = _MathHelper.degree_to_rad( v.x );
		v.y = _MathHelper.degree_to_rad( v.y );
		v.z = _MathHelper.degree_to_rad( v.z );
		
		return v;
		
	}
	
	function rotate_relative_to ( vec3, to, up ) {
		
		var vec3Rotated = utilVec31Rotated.copy( vec3 );
		
		if ( to instanceof THREE.Quaternion !== true ) {
			
			to = retrieve_relative_to( to, up );
		
		}
		
		if ( to instanceof THREE.Quaternion ) {
			
			to.multiplyVector3( vec3Rotated );
			
		}
		
		return vec3Rotated;
		
	}
	
	function retrieve_relative_to ( to, up ) {
		
		var matrix;
		
		if ( to ) {
			
			if ( to instanceof THREE.Object3D ) {
				
				if ( to.useQuaternion === true ) {
					
					to = to.quaternion;
					
				}
				else {
					
					matrix = utilMat41Relative.extractRotation( to.matrix );
					to = utilQ1Relative.setFromRotationMatrix( matrix );
					
				}
				
			}
			
			if ( to instanceof THREE.Vector3 ) {
				
				to = q_to_axis( up, to );
				
			}
			
		}
		
		return to;
		
	}
	
	function angle_between_vectors ( vFrom, vTo ) {
		
		var dist = _MathHelper.clamp( vFrom.dot( vTo ), -1, 1 );
		
		return Math.acos( dist );
		
	}
	
	function signed_angle_between_coplanar_vectors ( vFrom, vTo, vNormal ) {
		
		var angle = angle_between_vectors( vFrom, vTo ),
			sign = vNormal.dot( axis_between_vectors( vFrom, vTo ) );
		
		return sign < 0 ? -angle : angle;
		
	}
	
	function axis_between_vectors ( vFrom, vTo ) {
		
		return utilVec31Axis.cross( vFrom, vTo ).normalize();
		
	}
	
	function angle_from_q ( q ) {
		
		// if w>1 acos and sqrt will produce errors, this cant happen if quaternion is normalised
		if (q.w > 1) {
			
			q.normalize();
			
		}
		
		return 2 * Math.acos( q.w );
		
	}
	
	function q_to_axis ( axisFrom, axisTo, axisOrthonormal ) {
		
		var ca = shared.cardinalAxes,
			axis,
			angle,
			qToA = utilQ1Axis;
		
		// current axes
		
		axisFrom = axisFrom || ca.up;
		
		// check for invalid axes, i.e. axis with all 0
		
		if ( typeof axisTo === 'undefined' || axisTo.lengthSq() === 0 || axisFrom.lengthSq() === 0 ) {
			
			return false;
			
		}
		
		angle = angle_between_vectors( axisFrom, axisTo );
		
		if ( angle === 0 ) {
			
			return false;
		
		}
		
		// axis
		
		axis = axis_between_vectors( axisFrom, axisTo );
		
		// if new axis is exactly opposite of current
		// replace new axis with orthonormal axis
		
		if ( axis.lengthSq() === 0 ) {
			
			axis.copy( axisOrthonormal && axisOrthonormal.lengthSq() > 0 ? axisOrthonormal : get_orthonormal_vectors( axisFrom, true ) );
			
		}
		
		// rotation change
		
		return qToA.setFromAxisAngle( axis, angle );
		
	}
	
	/*===================================================
    
    orthonormals
    
    =====================================================*/
	
	function get_orthonormal_vectors ( v1, one ) {
		
		// returns 2 orthographic ( perpendicular ) vectors to the first
		
		var min = 0,
			minAxis,
			v1absx = Math.abs( v1.x ),
			v1absy = Math.abs( v1.y ),
			v1absz = Math.abs( v1.z ),
			v2 = new THREE.Vector3(),
			v3 = new THREE.Vector3();
		
		// use Gram-Schmidt orthogonalisation to find first perpendicular vector
		
		min = Math.min( v1absx, v1absy, v1absz );
		
		// min is x
		if ( min === v1absx ) {
			
			minAxis = 'x';
			
		}
		// min is y
		else if ( min === v1absy ) {
			
			minAxis = 'y';
			
		}
		// min is z
		else {
			
			minAxis = 'z';
			
		}
		
		v2[ minAxis ] = 1;
		v2.x -= v1[ minAxis ] * v1.x;
		v2.y -= v1[ minAxis ] * v1.y;
		v2.z -= v1[ minAxis ] * v1.z;
		
		if ( one === true ) {
			
			return v2;
			
		}
		else {
			
			v3.cross( v1, v2 );
			
			return { v1: v1, v2: v2, v3: v3 };
			
		}
		
	}
	
	function get_rotation_to_normal ( normal, normalAxis ) {
		
		// returns a 4x4 matrix that defines a rotation to a normal
		
		var vectors = get_orthonormal_vectors( normal ),
			v1 = vectors.v1,
			v2 = vectors.v2,
			v3 = vectors.v3,
			matrix;
		
		// normal on the x axis
		if ( normalAxis === 'x' ) {
			
			matrix = new THREE.Matrix4(
				v1.x, v2.x, v3.x, 0,
				v1.y, v2.y, v3.y, 0,
				v1.z, v2.z, v3.z, 0,
				0, 0, 0, 1
			);
			
		}
		// normal on the z axis
		else if ( normalAxis === 'z' ) {
			
			matrix = new THREE.Matrix4(
				v2.x, v3.x, v1.x, 0,
				v2.y, v3.y, v1.y, 0,
				v2.z, v3.z, v1.z, 0,
				0, 0, 0, 1
			);
			
		}
		// normal is on the y axis
		else {
			
			matrix = new THREE.Matrix4(
				v2.x, v1.x, v3.x, 0,
				v2.y, v1.y, v3.y, 0,
				v2.z, v1.z, v3.z, 0,
				0, 0, 0, 1
			);
			
		}
		
		return matrix;
		
	}
	
	/*===================================================
    
    lerp
    
    =====================================================*/
	
	function lerp ( from, to, alpha ) {
		
		from.x += ( to.x - from.x ) * alpha;
		from.y += ( to.y - from.y ) * alpha;
		from.z += ( to.z - from.z ) * alpha;
		
		if ( from.hasOwnProperty( 'w' ) ) {
			
			from.w += ( to.w - from.w ) * alpha;
			
		}
		
		return from;
		
	}
	
	function lerp_normalized ( from, to, alpha ) {
		
		return lerp( from, to, alpha ).normalize();
		
	}
	
	function lerp_snap ( from, to, alpha, threshold ) {
		
		if ( from.equals( to ) !== true ) {
			
			lerp( from, to, alpha );
			
			if ( from.distanceTo( to ) < threshold ) {
				
				from.copy( to );
				
			}
			
		}
		
		return from;
		
	}
	
} (KAIOPUA) );