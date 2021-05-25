/*
 *
 * SceneHelper.js
 * Contains utility functionality for basic hierarchy support.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/utils/SceneHelper.js",
		_SceneHelper = {};
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	init_internal();
	
	main.asset_register( assetPath, {
		data: _SceneHelper
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal () {
		
		// functions
		
		_SceneHelper.extract_children_from_objects = extract_children_from_objects;
		_SceneHelper.extract_parents_from_objects = extract_parents_from_objects;
		_SceneHelper.extract_parent_root = extract_parent_root;
		_SceneHelper.has_parent = has_parent;
		
	}
	
	/*===================================================
    
    hierarchy support
    
    =====================================================*/
	
	function extract_children_from_objects ( objects, cascade, ignoreOrCheck ) {
		
		var i, l,
			object,
			extractMethod;
		
		objects = main.to_array( objects );
		cascade = main.to_array( cascade );
		
		if ( typeof ignoreOrCheck === 'function' ) {
			
			extractMethod = extract_child_cascade_with_check;
			
		}
		else if ( typeof ignoreOrCheck !== 'undefined' ) {
			
			extractMethod = extract_child_cascade_with_ignore;
			
		}
		else {
			
			extractMethod = extract_child_cascade;
			
		}
		
		for ( i = 0, l = objects.length; i < l; i++ ) {
			
			extractMethod( objects[ i ], cascade, ignoreOrCheck );
			
		}
		
		return cascade;
		
	}
	
	function extract_child_cascade ( object, cascade ) {
		
		var i, l,
			children = object.children;
		
		Array.prototype.push.apply( cascade, children );
		
		for ( i = 0, l = children.length; i < l; i++ ) {
			
			extract_child_cascade( children[ i ], cascade );
			
		}
		
	}
	
	function extract_child_cascade_with_check ( object, cascade, check ) {
		
		var i, l,
			children;
			
		if ( check( object ) ) {
			
			children = object.children;
			
			Array.prototype.push.apply( cascade, children );
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				extract_child_cascade_with_check( children[ i ], cascade, check );
				
			}
			
		}
		
	}
	
	function extract_child_cascade_with_ignore ( object, cascade, ignore ) {
		
		var i, l,
			children;
			
		if ( typeof ignore === 'undefined' || main.index_of_value( ignore, object ) === -1 ) {
			
			children = object.children;
			
			Array.prototype.push.apply( cascade, children );
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				extract_child_cascade_with_ignore( children[ i ], cascade, ignore );
				
			}
			
		}
		
	}
	
	function extract_parents_from_objects ( objects, cascade ) {
		
		var i, l;
		
		objects = main.to_array( objects );
		cascade = main.to_array( cascade );
		
		for ( i = 0, l = objects.length; i < l; i++ ) {
			
			extract_parent_cascade( objects[ i ], cascade );
			
		}
		
		return cascade;
		
	}
	
	function extract_parent_cascade ( object, cascade ) {
		
		while( object.parent ) {
			
			cascade.push( object.parent );
			
			object = object.parent;
			
		}
		
	}
	
	function extract_parent_root ( object ) {
		
		while( object.parent ) {
			
			object = object.parent;
			
		}
		
		return object;
		
	}
	
	function has_parent ( object, parent ) {
		
		while( object ) {
			
			if ( object === parent ) {
				
				return true;
				
			}
			
			object = object.parent;
			
		}
		
		return false;
		
	}
	
} (KAIOPUA) );