/*
 *
 * Kaiopua.js
 * Main module of Kaiopua engine.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
var KAIOPUA = (function (main) {
	
	// console support
	
	window.console = window.console || {
		
		info: function () {},
		log: function () {},
		debug: function () {},
		warn: function () {},
		error: function () {}
		
	};
	
	// shared
	
    var shared = main.shared = main.shared || {};
	
	shared.domElements = {};
	shared.supports = {
		webGL: true
	};
	shared.throttled = {};
	shared.spawns = {};
	
	shared.pointers = [];
	shared.originLink = window.location.pathname.toString();
	
	shared.pathToIcons = 'img/';
	shared.pathToAssets = 'asset/';
	
	shared.frameRateMax = 60;
	shared.frameRateMin = 20;
	shared.time = new Date().getTime();
	shared.timeLast = shared.time;
	shared.timeDeltaExpected = 1000 / 60;
	shared.timeDeltaModDec = Math.pow( 10, 2 );
	shared.pointerWheelSpeed = 120;
	shared.pointerHoldPositionShift = 10;
	shared.pointerInGame = true;
	shared.throttleTimeShort = shared.timeDeltaExpected * 3;
	shared.throttleTimeMedium = 100;
	shared.throttleTimeLong = 250;
	shared.throttleTimeLong = 250;
	shared.focused = true;
	
	shared.errorString = 'error';
	shared.errorTypeGeneral = 'General';
	shared.errorTypeWebGLBrowser = 'WebGLBrowser';
	shared.errorTypeWebGLComputer = 'WebGLComputer';
    shared.errorTypes = [ shared.errorTypeGeneral, 'WebGLBrowser', 'WebGLComputer' ];
    shared.errorTypesOnlyOnce = [ 'WebGLBrowser', 'WebGLComputer' ];
	shared.webGLNames = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	
	shared.fadeBetweenSections = false;
	
	shared.domFadeDuration = 500;
	shared.domCollapseDuration = 500;
	shared.domFadeEasing = 'easeInOutCubic';
	shared.domCollapseEasing = 'easeInOutCubic';
	
	shared.screenWidth = 0;
	shared.screenHeight = 0;
	shared.screenViewableWidth = 0;
	shared.screenViewableHeight = 0;
	shared.screenOffsetTop = 0;
	shared.screenOffsetBottom = 0;
	shared.screenOffsetLeft = 0;
	shared.screenOffsetRight = 0;
	
	var loader = {},
		worker = {},
		_Scene,
		_CameraControls,
		_KeyHelper,
		_UI,
		sectionLauncher,
		sectionStart,
		renderComposer,
        renderPasses,
		setup = false,
		playable = false,
		ready = false,
		started = false,
        paused = false,
		focusLost = false,
		transitionDuration = 500,
        libsPrimaryList = [
            "js/lib/RequestAnimationFrame.js",
            "js/lib/RequestInterval.js",
            "js/lib/RequestTimeout.js",
            "js/lib/signals.min.js",
			"js/lib/jquery-1.8.3.min.js"
        ],
		libsSecondaryList = [
			"js/lib/hammer.custom.js",
			"js/lib/bootstrap.min.js",
			"js/lib/jquery.easing-1.3.min.js",
			"js/lib/jquery.throttle-debounce.custom.min.js",
			"js/lib/jquery.placeholdme.js"
		],
        assetsGameCompatibility = [
			"js/kaiopua/ui/UI.js",
			"js/kaiopua/utils/KeyHelper.js"
        ],
        assetsGameFoundation = [
            "js/lib/three/three.min.js",
			"js/lib/Tween.custom.min.js"
        ],
		assetsGameFoundationExtras = [
			"js/lib/three/ThreeOctree.min.js",
            "js/lib/three/postprocessing/ShaderExtras.js",
            "js/lib/three/postprocessing/EffectComposer.js",
            "js/lib/three/postprocessing/RenderPass.js",
            "js/lib/three/postprocessing/MaskPass.js",
            "js/lib/three/postprocessing/ShaderPass.js"
		],
		assetsGameCore = [
			"js/kaiopua/core/Scene.js",
			"js/kaiopua/core/CameraControls.js"
		],
        assetsGameLauncher = [
            "js/kaiopua/sections/Launcher.js"
        ],
        assetsGamePlayable = [
			"js/kaiopua/sections/Start.js"
        ];
	
	/*===================================================
    
    init
    
    =====================================================*/
	
    // load scripts
    $LAB.script( libsPrimaryList ).wait().script( libsSecondaryList ).wait( init );
    
    function init () {
		console.log( "[ KAI 'OPUA <3 ]" );
		shared.domElements.$game = $('#game');
		
		shared.supports.pointerEvents = Modernizr.testProp('pointerEvents');
       
        shared.signals = {
			
			onError : new signals.Signal(),
			
			onFocusLost: new signals.Signal(),
			onFocusGained: new signals.Signal(),
    
            onKeyPressed : new signals.Signal(),
            onKeyReleased : new signals.Signal(),
			onGameInput : new signals.Signal(), 
    
            onWindowResized : new signals.Signal(),
			
			onUpdated: new signals.Signal(),
			
			onWorkerReset : new signals.Signal(),
			onWorkerTaskStarted : new signals.Signal(),
			onWorkerTaskCompleted : new signals.Signal(),
			onWorkerTasksCompleted : new signals.Signal(),
            
            onLoadItemCompleted : new signals.Signal(),
            onLoadListCompleted : new signals.Signal(),
            onLoadAllCompleted : new signals.Signal(),
			
			onAssetReady : new signals.Signal(),
			
			onGameStateChange: new signals.Signal(),
			onGamePlayable : new signals.Signal(),
			onGameReady: new signals.Signal(),
			onGamePaused : new signals.Signal(),
			onGameResumed : new signals.Signal(),
			onGameUpdated : new signals.Signal(),
			onGameStarted : new signals.Signal(),
			onGameStartedCompleted : new signals.Signal(),
			onGameStopped : new signals.Signal(),
			onGameStoppedCompleted : new signals.Signal(),
			
			onGamePointerLeft : new signals.Signal(),
			onGamePointerEntered : new signals.Signal(),
			onGamePointerMoved : new signals.Signal(),
			onGamePointerTapped : new signals.Signal(),
			onGamePointerDoubleTapped : new signals.Signal(),
			onGamePointerHeld : new signals.Signal(),
			onGamePointerDragStarted : new signals.Signal(),
			onGamePointerDragged : new signals.Signal(),
			onGamePointerDragEnded : new signals.Signal(),
			onGamePointerWheel : new signals.Signal()
            
        };
        
        // add listeners for global events
        // each listener dispatches shared signal
		
		shared.throttled.reposition_pointer = $.throttle( shared.throttleTimeShort, reposition_pointer );
		shared.throttled.on_window_resized = $.throttle( shared.throttleTimeLong, on_window_resized );
		
		$( window )
			.on( 'mousemove', shared.throttled.reposition_pointer )
			.on( 'blur', on_focus_lost )
			.on( 'focus', on_focus_gained )
			.on( 'resize', shared.throttled.on_window_resized );
		
		window.onerror = on_error;
		
		shared.signals.onFocusLost.add( function () {
			
			if ( paused !== true ) {
				
				focusLost = true;
			
			}
			
			pause( true );
			
		} );
		
		shared.signals.onFocusGained.add( function () {
			
			if ( focusLost === true ) {
				
				focusLost = false;
				
				resume( true );
				
			}
			
		} );
	
		// loader
		
		loader.active = false;
		loader.listCount = 0;
		loader.lists = [];
		loader.listLocations = {};
		loader.listLoaded = {};
		loader.listMessages = {};
		loader.listCallbacks = {};
		loader.loading = [];
		loader.loadingListIDs = [];
		loader.started = [];
		loader.loaded = [];
		loader.loadingOrLoaded = [];
		loader.listCurrent = '';
		loader.loadTypeBase = 'script';
		loader.tips = [];
		
		add_loaded_locations( libsPrimaryList );
		add_loaded_locations( libsSecondaryList );
		
		// init worker
		
		worker.taskCount = 0;
		worker.tasksStarted = [];
		worker.tasksCompleted = [];
		
		worker_reset();
		
		// public functions
		
		main.type = type;
		main.is_number = is_number;
		main.is_array = is_array;
		main.is_image = is_image;
		main.is_image_ext = is_image_ext;
		main.is_event = is_event;
		
		main.extend = extend;
		main.time_test = time_test;
		
		main.to_array = to_array;
		main.ensure_not_array = ensure_not_array;
		main.array_cautious_add = array_cautious_add;
		main.array_cautious_remove = array_cautious_remove;
		main.array_random_value = array_random_value;
		main.array_random_value_remove = array_random_value_remove;
		main.index_of_value = index_of_value;
		main.last_index_of_value = last_index_of_value;
		main.indices_of_value = indices_of_value;
		main.index_of_values = index_of_values;
		main.index_of_property = index_of_property;
		main.indices_of_property = indices_of_property;
		main.index_of_properties = index_of_properties;
		
		main.dom_extract = dom_extract;
		main.dom_generate_image = dom_generate_image;
		main.dom_ignore_pointer = dom_ignore_pointer;
		main.dom_fade = dom_fade;
		main.dom_collapse = dom_collapse;
		
		main.get_pointer = get_pointer;
		main.reposition_pointer = reposition_pointer;
		
		main.worker_reset = worker_reset;
		main.worker_task_start = worker_task_start;
		main.worker_task_complete = worker_task_complete;
		
		main.load = load;
		main.get_is_loaded = get_is_loaded;
		main.get_is_loading = get_is_loading;
		main.get_is_loading_or_loaded = get_is_loading_or_loaded;
		
		main.get_asset_path = get_asset_path;
		main.get_ext = get_ext;
		main.add_default_ext = add_default_ext;
		main.remove_ext = remove_ext;
		main.get_alt_path = get_alt_path;
		
		main.asset_register = asset_register;
		main.asset_require = asset_require;
		main.asset_ready = asset_ready;
		main.set_asset = set_asset;
		main.get_asset = get_asset;
		main.get_asset_data = get_asset_data;
		
		main.set_section = set_section;
		
		main.start = start;
		main.stop = stop;
		main.resume = resume;
		main.pause = pause;
		
		// getters and setters
		
		Object.defineProperty(main, 'paused', { 
			get : function () { return paused; }
		});
		
		Object.defineProperty(main, 'started', { 
			get : function () { return started; }
		});
		
		Object.defineProperty(main, 'setup', { 
			get : function () { return setup; }
		});
		
		Object.defineProperty(main, 'playable', { 
			get : function () { return playable; }
		});
		
		Object.defineProperty( main, 'ready', { 
			get : function () { return ready; },
			set : function ( rdy ) {
				
				if ( ready !== rdy ) {
					
					ready = rdy;
					
					shared.signals.onGameReady.dispatch( ready );
					shared.signals.onGameStateChange.dispatch( ready );
					
				}
				
			}
		} );
		
		Object.defineProperty(main, 'focusLost', { 
			get : function () { return focusLost; }
		});
		
		// begin
		
		$( window ).ready ( function () {
			
			$( window ).trigger( 'resize' );
			
			update();
				
			asset_require( assetsGameCompatibility, compatibility_check, true );
			
		} );
		
    }
	
	/*===================================================
    
	compatibility
    
    =====================================================*/
	
	function compatibility_check ( ui, kh ) {
		//console.log('GAME: compatiblity check');
		
		var i, l,
			canvas, 
			context, 
			errorType;
		
		_UI = ui;
		_KeyHelper = kh;
		
		try {
			
			// webgl browser check
			if ( !window.WebGLRenderingContext ) {
				
				errorType = shared.errorTypeWebGLBrowser;
				
			}
			else {
				
				canvas = document.createElement( 'canvas' );
				
				// try each browser's webgl type
				
				for (i = 0, l = shared.webGLNames.length; i < l; i += 1) {
					
					context = canvas.getContext( shared.webGLNames[i] );
					
					if ( context ) {
						
						break;
						
					}
					
				}
				
				// if none found, there is another problem
				if ( !context ) {
					
					errorType = shared.errorTypeWebGLComputer;
					
				}
				
			}
		
		}
		catch ( err ) {
			
			errorType = shared.errorTypeWebGLBrowser;
			
		}
		
		shared.errorCurrent = errorType;
		
        if ( typeof shared.errorCurrent !== 'undefined' ) {
			
			shared.supports.webGL = false;
			
			shared.signals.onGameStateChange.dispatch();
			
			on_error( shared.errorCurrent );
			
        }
        else {
			
			load_game_foundation();
			
        }
		
	}
	
	function load_game_foundation () {
		
		main.asset_require( assetsGameFoundation, [ load_game_foundation_extras ], true );
		
	}
	
	function load_game_foundation_extras () {
		
		main.asset_require( assetsGameFoundationExtras, [ init_foundation, load_game_core ], true );
		
	}
	
	function load_game_core () {
		
		main.asset_require( assetsGameCore, [ init_setup, load_game_launcher ], true );
		
	}
	
	function load_game_launcher () {
		
		main.asset_require( assetsGameLauncher, [ init_launcher, load_game_playable ], true );
		
	}
	
	function load_game_playable () {
		
		main.asset_require( assetsGamePlayable, init_playable, true );
		
	}
	
	/*===================================================
    
	foundation
    
    =====================================================*/
    
    function init_foundation () {
		//console.log('GAME: foundation');
		
		// universe gravity
		
		shared.universeGravitySource = new THREE.Vector3( 0, 0, 0 );
		shared.universeGravityMagnitude = new THREE.Vector3( 0, -0.4, 0 );
		
		// cardinal axes
		
		shared.cardinalAxes = {
			up: new THREE.Vector3( 0, 1, 0 ),
			forward: new THREE.Vector3( 0, 0, 1 ),
			right: new THREE.Vector3( -1, 0, 0 )
		};
		
		// renderer
		
        shared.renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 0, maxLights: 8 } );
        shared.renderer.setSize( shared.gameWidth, shared.gameHeight );
        shared.renderer.autoClear = false;
		
        // render target
        shared.renderTarget = new THREE.WebGLRenderTarget( shared.gameWidth, shared.gameHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter } );
		
    }
	
	/*===================================================
    
	setup
    
    =====================================================*/
    
    function init_setup ( sc, cc ) {
		//console.log('GAME: setup');
		// utility
		
		_Scene = sc;
		_CameraControls = cc;
		
		// scenes
		
		shared.scene = new _Scene.Instance();
		shared.sceneBG = new _Scene.Instance();
		
        // fog
		
        shared.scene.fog = undefined;
		
		// physics
		
		main.physics = shared.scene.physics;
		
		// camera
		
		shared.camera = new THREE.PerspectiveCamera(60, shared.gameWidth / shared.gameHeight, 1, 20000);
		shared.cameraBG = new THREE.PerspectiveCamera(60, shared.gameWidth / shared.gameHeight, 1, 20000);
		shared.camera.useQuaternion = shared.cameraBG.useQuaternion = true;
		
		// camera controls
		
		shared.cameraControls = new _CameraControls.Instance( { camera: shared.camera } );
		shared.cameraControls.onCameraMoved.add( $.throttle( shared.throttleTimeMedium, function () {
			
			shared.domElements.$game.triggerHandler( 'mousemove' );
			
		} ) );
		
		// passes
        
        renderPasses = {
			bg: new THREE.RenderPass( shared.sceneBG, shared.cameraBG ),
            env: new THREE.RenderPass( shared.scene, shared.camera ),
            screen: new THREE.ShaderPass( THREE.ShaderExtras.screen )
        };
		
		renderPasses.env.clear = false;
        renderPasses.screen.renderToScreen = true;
		
        // composer
		
		renderComposer = new THREE.EffectComposer( shared.renderer, shared.renderTarget );
		
		renderComposer.addPass( renderPasses.bg );
		renderComposer.addPass( renderPasses.env );
		renderComposer.addPass( renderPasses.screen );
		
		// add renderer to display
		
		shared.domElements.$game.prepend( shared.renderer.domElement );
		
		// events
		
        $( document )
			.on( 'keydown', on_key_pressed )
			.on( 'keyup', on_key_released );
		
		shared.throttled.on_game_pointer_moved = $.throttle( shared.throttleTimeShort, on_game_pointer_moved );
		shared.throttled.on_game_pointer_dragged = $.throttle( shared.throttleTimeShort, true, on_game_pointer_dragged );
		
		shared.domElements.$game
			.on( 'mouseleave', on_game_pointer_left )
			.on( 'mouseenter', on_game_pointer_entered )
			.on( 'mousemove', shared.throttled.on_game_pointer_moved )
			.on( 'tap', on_game_pointer_tapped )
			.on( 'doubletap', on_game_pointer_doubletapped )
			.on( 'hold', on_game_pointer_held )
			.on( 'dragstart', on_game_pointer_dragstarted )
			.on( 'drag', shared.throttled.on_game_pointer_dragged )
			.on( 'dragend', on_game_pointer_dragended )
			.on( 'mousewheel DOMMouseScroll', on_game_pointer_wheel )
			.on( 'contextmenu', on_context_menu );
		
		setup = true;
		
		// resize once
		
		on_window_resized();
		
    }
	
	/*===================================================
    
    init launcher
    
    =====================================================*/
	
	function init_launcher ( launcher ) {
		
		sectionLauncher = launcher;
		
		set_section( sectionLauncher );
		
	}
	
	/*===================================================
    
	playable
    
    =====================================================*/
	
	function init_playable ( st ) {
		//console.log('GAME: playable');
		
		sectionStart = st;
		
		playable = true;
		
		shared.signals.onGamePlayable.dispatch();
		shared.signals.onGameStateChange.dispatch();
		
	}
	
	/*===================================================
    
    section functions
    
    =====================================================*/

    function set_section ( section, callback ) {
		
		var fadeBetweenSections = shared.fadeBetweenSections,
			hadPreviousSection = false,
			newSectionCallback = function () {
				
				if ( typeof shared.sectionLast !== 'undefined' ) {
					
					shared.sectionLast.remove();
					
				}
				
                section.show();
				
                shared.section = section;
				
				// hide blocker
				
				if ( fadeBetweenSections !== false ) {
					
					main.dom_fade( {
						element: shared.domElements.$uiBlocker
					} );
					
				}
				
				resume();
				
				if ( typeof callback !== 'undefined' ) {
					
					callback.call();
					
				}
				
			};
		
		// pause game while changing sections
		
		pause( true );
		
        // hide current section
        if (typeof shared.section !== 'undefined') {
			
			hadPreviousSection = true;
            
            shared.sectionLast = shared.section;
            
            shared.sectionLast.hide();
			
			// block ui
            
			if ( fadeBetweenSections !== false ) {
				
				main.dom_fade( {
					element: shared.domElements.$uiBlocker,
					opacity: 1
				} );
				
			}
            
        }
		
        // no current section
		
        shared.section = undefined;
		
		// set started
		
		if ( typeof startedValue !== 'undefined' ) {
		
			started = startedValue;
			
		}
        
        // start and show new section
        if ( typeof section !== 'undefined' ) {
			
            // wait for blocker to finish fading in
			
			if ( fadeBetweenSections !== false && hadPreviousSection === true ) {
				
				window.requestTimeout( function () {
					
					newSectionCallback();
					
				}, transitionDuration );
			
			}
			// no previous section, create new immediately
			else {
				
				newSectionCallback();
				
			}
            
        }
		
    }
	
	/*===================================================
    
    start / stop
    
    =====================================================*/
    
    function start () {
		
		if ( playable === true ) {
			
			// start or resume
			
			if ( started === false ) {
				//console.log('GAME: START');
				// set started
				
				started = true;
				shared.signals.onGameStarted.dispatch();
				
				// set intro section
				
				set_section( sectionStart, function () {
					
					shared.signals.onGameStartedCompleted.dispatch();
					
				} );
				
			
			}
			else {
				
				resume();
				
			}
			
		}
		
    }
	
	function stop () {
		
		if ( playable === true ) {
			//console.log('GAME: STOP');
			started = false;
			
			// signal
			
			shared.signals.onGameStopped.dispatch();
			
			// set launcher section
			
			set_section( sectionLauncher, function () {
				
				shared.signals.onGameStoppedCompleted.dispatch();
				
			});
		
		}
		
	}
	
	/*===================================================
    
    pause / resume
    
    =====================================================*/
	
    function pause ( preventDefault, $menu ) {
		
		// set state
		
        if ( paused === false ) {
            //console.log('GAME: PAUSE');
            paused = true;
			
			shared.signals.onGamePaused.dispatch( preventDefault, $menu );
			
			// render once to ensure user is not surprised when resuming
			
			render();
            
        }
		
    }
    
    function resume ( refocused ) {
		
        if ( paused === true && ( typeof shared.errorCurrent === 'undefined' || started !== true ) ) {
			//console.log('GAME: RESUME');
			paused = false;
			
			shared.signals.onGameResumed.dispatch( refocused );
            
        }
    }
	
	/*===================================================
    
    update
    
    =====================================================*/
	
	function update () {
		
		var timeDelta,
			timeDeltaMod;
        
        window.requestAnimationFrame( update );
		
		// handle time
		
		shared.timeLast = shared.time;
		
		shared.time = new Date().getTime();
		
		timeDelta = shared.time - shared.timeLast;
		
		// get time delta modifier from timeDelta vs expected refresh interval
		
		timeDeltaMod = Math.round( ( timeDelta / shared.timeDeltaExpected ) * shared.timeDeltaModDec ) / shared.timeDeltaModDec;
		
		if ( is_number( timeDeltaMod ) !== true ) {
			
			timeDeltaMod = 1;
			
		}
		
		// update master
		
		shared.signals.onUpdated.dispatch( timeDelta, timeDeltaMod );
		
		// update game
		
		if ( paused !== true && setup === true ) {
			
			TWEEN.update();
			
			if ( main.physics ) {
				
				main.physics.update( timeDelta, timeDeltaMod );
				
			}
			
			shared.signals.onGameUpdated.dispatch( timeDelta, timeDeltaMod );
			
			// finish frame
			
			render();
			
		}
		
	}
	
	/*===================================================
    
    render
    
    =====================================================*/
    
	function render() {
		
		if ( setup === true ) {
			
			shared.cameraControls.update();
			
			shared.cameraBG.quaternion.copy( shared.camera.quaternion );
			
			shared.renderer.setViewport( 0, 0, shared.gameWidth, shared.gameHeight );
			
			shared.renderer.clear();
			
			renderComposer.render();
			
		}
		
	}
	
	/*===================================================
    
    type checking
    
    =====================================================*/
	
	function type ( o ) {
		return o===null?o+'':Object.prototype.toString.call(o).slice(8,-1).toLowerCase();
	}
	
	function is_array ( target ) {
		return Object.prototype.toString.call( target ) === '[object Array]';
	}
	
	function is_number ( n ) {
		return !isNaN( n ) && isFinite( n ) && typeof n !== 'boolean';
	}
	
	function is_image ( target ) {
		return ( typeof target !== 'undefined' && target.hasOwnProperty('nodeName') && target.nodeName.toLowerCase() === 'img' );
	}
	
	function is_image_ext ( ext ) {
		
		if ( ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp' ) {
			return true;
		}
		else {
			return false;
		}
		
    }
	
	function is_event ( obj ) {
		return obj && ( obj.type && ( obj.target || obj.srcElement ) );
	}
	
	/*===================================================
    
    general helpers
    
    =====================================================*/
	
	// object cloning/extending
	// copies both enumerable and non-enumerable properties
	// copies getters and setters correctly
	// optional: deep copying while avoiding infinite recursion
	// deep copy only makes one copy of any object, regardless of how many times / places it is referenced
	
	function extend ( source, destination, deep, records ) {
		
		var i, l,
			propertyNames,
			name,
			descriptor,
			value,
			valueType,
			recordSources,
			recordCopies,
			recordSourceIndex,
			recordCopyIndex,
			recordSource,
			recordCopy;
		
		if ( typeof source !== 'undefined' ) {
			
			destination = main.type( destination ) === 'object' ? destination : {};
			
			propertyNames = Object.getOwnPropertyNames( source );
			
			for ( i = 0, l = propertyNames.length; i < l; i++ ) {
				
				name = propertyNames[ i ];
				
				descriptor = Object.getOwnPropertyDescriptor( source, name );
				
				if ( destination.hasOwnProperty( name ) ) {
					
					delete destination[ name ];
					
				}
				
				Object.defineProperty( destination, name, descriptor );
				
				// if deep copy
				
				if ( deep === true ) {
					
					// get descriptor that was just set
					
					descriptor = Object.getOwnPropertyDescriptor( destination, name );
					
					value = descriptor.value;
						
					valueType = type( value );
					
					// if the value of the descriptor is an object or array
					
					if ( valueType === 'object' || valueType === 'array' ) {
						
						records = records || { sources: [], copies: [] };
						
						recordSources = records.sources;
						
						recordCopies = records.copies;
						
						recordSourceIndex = index_of_value( recordSources, value );
						
						// if value does not yet exist in records
						
						if ( recordSourceIndex === -1 ) {
							
							recordSource = recordSources[ recordSources.length ] = value;
							
							recordCopy = recordCopies[ recordCopies.length ] = ( valueType === 'object' ? {} : [] );
							
							// special case when object has a reference to itself
							
							if ( value === source ) {
								value[ name ] = recordCopy;
							}
							
							descriptor.value = extend( value, recordCopy, true, records );
							
						}
						else {
							
							descriptor.value = recordCopies[ recordSourceIndex ];
							
						}
						
						// set descriptor again with new deep copied value
					
						Object.defineProperty( destination, name, descriptor );
						
					}
					
				}
				
			}
			
		}
		
		return destination;
		
	}
	
	function time_test ( fn, iterations, message ) {
		
		var i,
			ta, tb,
			result;
		
		iterations = is_number( iterations ) && iterations > 0 ? iterations : 1;
		
		message = typeof message === 'string' ? message : '';
		
		ta = new Date().getTime();
		
		for ( i = 0; i < iterations; i++ ) {
			
			result = fn.call();
			
		}
		
		tb = new Date().getTime();
		
		console.log( message, ' > time test ( x', iterations, '): ', (tb - ta) );
		
		return result;
		
	}
	
	/*===================================================
    
    array / object helpers
    
    =====================================================*/
	
	function to_array ( target ) {
		
		return target ? ( is_array ( target ) !== true ? [ target ] : target ) : [];
		
	}
	
	function ensure_not_array ( target, index ) {
		
		return is_array ( target ) === true ? target[ index || 0 ] : target;
		
	}
	
	function array_cautious_add ( target, elements ) {
		
		var i, l,
			element,
			index,
			added = false;
		
		target = to_array( target );
		elements = to_array( elements );
		
		// for each element
		
		for ( i = 0, l = elements.length; i < l; i++ ) {
			
			element = elements[ i ];
			
			index = index_of_value( target, element );
			
			if ( index === -1 ) {
				
				target.push( element );
				
				added = true;
				
			}
			
		}
		
		return added;
		
	}
	
	function array_cautious_remove ( target, elements ) {
		
		var i, l,
			element,
			index,
			removed = false;
		
		target = to_array( target );
		elements = to_array( elements );
		
		// for each element
		
		for ( i = 0, l = elements.length; i < l; i++ ) {
			
			element = elements[ i ];
			
			index = index_of_value( target, element );
			
			if ( index !== -1 ) {
				
				target.splice( index, 1 );
				
				removed = true;
				
			}
			
		}
		
		return removed;
		
	}
	
	function array_random_value ( array ) {
		
		return array[ Math.round( Math.random() * ( array.length - 1 ) ) ];
		
	}
	
	function array_random_value_remove ( array ) {
		
		return array.splice( Math.round( Math.random() * ( array.length - 1 ) ), 1 )[ 0 ];
		
	}
	
	function index_of_value( array, value ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ] ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function last_index_of_value( array, value ) {
		
		for ( var i = array.length - 1; i >= 0; i-- ) {
			
			if ( value === array[ i ] ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function indices_of_value( array, value ) {
		
		var indices = [];
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ] ) {
				
				indices.push( i );
				
			}
			
		}
		
		return indices;
		
	}
	
	function index_of_values( array, values ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( index_of_value( values, array[ i ] ) !== -1 ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function index_of_property( array, property, value ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ][ property ] ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function indices_of_property( array, property, value ) {
		
		var indices = [];
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ][ property ] ) {
				
				indices.push( i );
				
			}
			
		}
		
		return indices;
		
	}
	
	function index_of_properties( array, properties, values ) {
		
		for ( var i = 0, il = array.length; i < il; i++ ) {
			
			for ( var j = 0, jl = properties.length; j < jl; j++ ) {
				
				if ( values[ j ] === array[ i ][ properties[ j ] ] ) {
					
					return i;
					
				}
				
			}
			
		}
		
		return -1;
		
	}
	
	/*===================================================
    
    pointer
    
    =====================================================*/
	
	function get_pointer ( parameters ) {
		
		parameters = parameters || {};
		
		var id = parameters.identifier = ( parameters.identifier ? parameters.identifier : 0 ),
			pointer = shared.pointers[ id ];

		if ( typeof pointer === 'undefined' ) {
			
			pointer = shared.pointers[ id ] = {};
			pointer.id = id;
			pointer.x = pointer.lx = shared.screenWidth * 0.5;
			pointer.y = pointer.ly = shared.screenHeight * 0.5;
			pointer.deltaX = pointer.deltaY = pointer.angle = pointer.distance = pointer.distanceX = pointer.distanceY = 0;
			pointer.direction = 'none';
		
		}
		
		return pointer;
		
	}
	
	function reposition_pointer ( e ) {
		
		shared.timeSinceInteraction = 0;
		
		var pointer= main.get_pointer( e ),
			position,
			d,
			b;
		
		if ( e ) {
			
			position = e.position;
			
			if ( is_array( position ) && position[ pointer.id ] ) {
				
				position = position[ pointer.id ];
				
			}
			
			if ( typeof position === 'undefined' ) {
				
				d = document;
				b = d.body;
				
				position = {
					x: pointer.x,
					y: pointer.y
				};
				
				if (  typeof e.pageX !== 'undefined' ) position.x = e.pageX;
				else if ( typeof e.clientX !== 'undefined' ) position.x = e.clientX + ( d && d.scrollLeft || b && b.scrollLeft || 0 ) - ( d && d.clientLeft || b && b.clientLeft || 0 );
				
				if (  typeof e.pageY !== 'undefined' ) position.y = e.pageY;
				else if ( typeof e.clientY !== 'undefined' ) position.y = e.clientY + ( d && d.scrollTop || b && b.scrollTop || 0 ) - ( d && d.clientTop || b && b.clientTop || 0 );
				
			}
			
			if ( pointer.x !== position.x || pointer.y !== position.y ) {
				
				pointer.x = position.x || pointer.x;
				pointer.y = position.y || pointer.y;
				
				pointer.deltaX = pointer.x - pointer.lx;
				pointer.deltaY = pointer.y - pointer.ly;
				
				pointer.lx = pointer.x;
				pointer.ly = pointer.y;
				
				pointer.angle = e.angle || 0;
				pointer.direction = e.direction || 'none';
				
			}
			
		}
		
		return pointer;
		
	}
	
	/*===================================================
    
    event functions
    
    =====================================================*/
	
	function on_game_pointer_left ( e ) {
		
		shared.pointerInGame = false;
		
		shared.signals.onGamePointerLeft.dispatch( e );
		
	}
	
	function on_game_pointer_entered ( e ) {
		
		shared.pointerInGame = true;
		
		shared.signals.onGamePointerEntered.dispatch( e );
		
	}
	
	function on_game_pointer_moved ( e ) {
		
		// check if pointer is in game
		// throttling can cause pointer move to fire after pointer leaves
		
		if ( shared.pointerInGame === true ) {
			
			// no need to reposition, handled by window mousemove
			
			shared.signals.onGamePointerMoved.dispatch( e );
			
			on_game_input( e );
			
		}
		
	}
	
	function on_game_pointer_tapped ( e ) {
		
		shared.signals.onGamePointerTapped.dispatch( e, reposition_pointer( e ) );
		
		on_game_input( e );
		
	}
	
	function on_game_pointer_doubletapped ( e ) {
		
		shared.signals.onGamePointerDoubleTapped.dispatch( e, reposition_pointer( e ) );
		
		on_game_input( e );
		
	}
	
	function on_game_pointer_held ( e ) {
			
		shared.signals.onGamePointerHeld.dispatch( e, reposition_pointer( e ) );
		
		on_game_input( e );
		
	}
	
	function on_game_pointer_dragstarted ( e ) {
		
		shared.signals.onGamePointerDragStarted.dispatch( e, main.get_pointer( e ) );
		
		on_game_input( e );
		
	}
    
    function on_game_pointer_dragged( e ) {
		
		// no reposition because pointer move takes care of it
		
		shared.signals.onGamePointerDragged.dispatch( e, main.get_pointer( e ) );
		
		on_game_input( e );
		
    }
	
	function on_game_pointer_dragended ( e ) {
		
		shared.signals.onGamePointerDragEnded.dispatch( e, main.get_pointer( e ) );
		
		on_game_input( e );
		
	}
	
	function on_game_pointer_wheel ( e ) {
		
		var eo = e.originalEvent || e;
		
		// normalize scroll across browsers
		// simple implementation, removes acceleration
		
		e.wheelDelta = eo.wheelDelta = ( ( eo.detail < 0 || eo.wheelDelta > 0 ) ? 1 : -1 ) * shared.pointerWheelSpeed;
		
		shared.signals.onGamePointerWheel.dispatch( e );
		
		on_game_input( e );
        
        e.preventDefault();
		
    }
	
	function on_context_menu ( e ) {
		
		// disable right click menu while in game
		
		e.preventDefault();
		
	}

    function on_key_pressed( e ) {
		
        shared.signals.onKeyPressed.dispatch( e );
		
		on_game_input( e );
		
    }

    function on_key_released( e ) {
		
        shared.signals.onKeyReleased.dispatch( e );
		
		on_game_input( e );
		
    }
	
	function on_game_input ( e ) {
		
		var keyCode,
			keyName,
			state,
			type;
		
		// check for meta keys
		
		if ( typeof e === 'undefined' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ) {
			return;
		}
		
		// handle by type
		
		type = ( e.type + '' );
		
		// special cases for pointer / mouse
		
		if ( type === 'tap' || type === 'doubletap' || type === 'hold' || type === 'dragstart' || type === 'drag' || type === 'dragend' || type === 'mousemove' ) {
			
			keyName = 'pointer';
			state = type;
			
		}
		else if ( type === 'mousewheel' || type === 'DOMMouseScroll' ) {
			
			keyName = 'pointer';
			state = 'wheel';
			
		}
		// fallback to key press
		else {
			
			keyCode = ( ( e.which || e.key || e.keyCode ) + '' ).toLowerCase();
			keyName = _KeyHelper.key( keyCode );
			
			state = type.toLowerCase();
			state = state.replace( 'key', '' );
			
		}
		
		shared.signals.onGameInput.dispatch( e, keyName, state );
		
	}
	
	function on_focus_lost ( e ) {
		
		shared.focused = false;
		
		shared.signals.onFocusLost.dispatch( e );
		
	}
	
	function on_focus_gained ( e ) {
		
		shared.focused = true;
		
		shared.signals.onFocusGained.dispatch( e );
		
	}

    function on_window_resized( e ) {
		
		var gameWidth,
			gameHeight;
        
        shared.screenWidth = $(window).width();
        shared.screenHeight = $(window).height();
		
		shared.screenViewableWidth = shared.domElements.$game.width();
		shared.screenViewableHeight = shared.domElements.$game.height();
		
		// handle ui first
		
		if ( _UI ) {
			
			_UI.resize();
			
		}
		
		// remaining
		
		if ( setup === true ) {
			
			shared.signals.onWindowResized.dispatch( shared.screenWidth, shared.screenHeight );
			
			// renderer
			
			gameWidth = shared.gameWidth = shared.screenViewableWidth;
			gameHeight = shared.gameHeight = shared.screenViewableHeight;
			
			$( shared.renderer.domElement ).css( {
				'top': shared.screenOffsetTop,
				'bottom': shared.screenOffsetBottom,
				'left': shared.screenOffsetLeft,
				'right': shared.screenOffsetRight
			} );
			shared.renderer.setSize( gameWidth, gameHeight );
			shared.renderTarget.width = gameWidth;
			shared.renderTarget.height = gameHeight;
			
			shared.cameraBG.aspect = shared.camera.aspect = gameWidth / gameHeight;
			shared.camera.updateProjectionMatrix();
			shared.cameraBG.updateProjectionMatrix();
			
			renderComposer.reset( shared.renderTarget );
			
			// re-render
			
			render();
			
		}
        
    }
	
	function on_error ( error, origin, lineNumber ) {
		
		shared.signals.onError.dispatch( error, origin || 'Unknown Origin', lineNumber || 'N/A' );
		
	}
	
	/*===================================================
    
    dom
    
    =====================================================*/
	
	function dom_extract ( element ) {
		
		return element instanceof $ ? element.get( 0 ) : element;
		
	}
	
	function dom_ignore_pointer ( $element, state ) {
		
		// use native pointer-events when available
		
		if ( shared.supports.pointerEvents ) {
			
			if ( state === true ) {
				
				$element.addClass( 'ignore-pointer-temporary' );
				
			}
			else {
				
				$element.removeClass( 'ignore-pointer-temporary' );
			
			}
			
		}
		else {
			
			// fallback in-case browser does not support pointer-events property
			// this method is incredibly slow, as it has to hide element, retrigger event to find what is under, then show again
			
			if ( state === true ) {
				
				$element.on( 'tap.pointer doubletap.pointer hold.pointer dragstart.pointer drag.pointer, dragend.pointer', 
					function ( e ) { 
						
						e.preventDefault();
						e.stopPropagation();
						
						$element.stop( true ).addClass( 'invisible' );
						
						$( document.elementFromPoint( e.clientX, e.clientY ) ).trigger( e );
						
						$element.stop( true ).removeClass( 'invisible' );
						
						return false;
						
					}
				);
				
			}
			else {
				
				$element.off( '.pointer' );
				
			}
			
		}
		
	}
	
	function dom_generate_image ( path, callback, context, image ) {
		
		var loadCallback = function () {
			
			if ( typeof callback === 'function' ) {
				
				callback.call( context, image );
				
			}
			
		};
		
		if ( is_image( image ) !== true ) {
			
			image = new Image();
			
		}
		
		image.crossOrigin = '';
		image.src = path;
		
		if ( image.complete ) {
			
			loadCallback();
		}
		else {
			
			image.onload = loadCallback;
			
		}
		
		return image;
		
    }
	
	function dom_fade( parameters ) {
		
		var $elements,
			duration,
			opacity,
			easing,
			callback,
			makeInvisible;
		
		// handle parameters
		
		parameters = parameters || {};
		
		$elements = $( parameters.element );
		duration = is_number( parameters.duration ) ? parameters.duration : shared.domFadeDuration;
		opacity = is_number( parameters.opacity ) ? parameters.opacity : 0;
		easing = typeof parameters.easing === 'string' ? parameters.easing : shared.domFadeEasing;
		callback = parameters.callback;
		
		// for each element
		
		$elements.each( function () {
			
			var $element = $( this ),
				$ignore,
				isCollapsed,
				isHidden,
				isInvisible,
				makeInvisible,
				fadeComplete = function () {
					
					$element.removeClass( 'hiding' );
					
					// if faded out completely, hide
					
					if ( opacity === 0 ) {
						
						$element.addClass( makeInvisible ? 'invisible' : 'hidden' ).css( 'opacity', '' ).trigger( 'hidden' );
						
						// reenable all buttons and links
						
						dom_ignore_pointer( $ignore, false );
						
					}
					else {
						
						$element.trigger( 'shown' );
						
						if ( opacity === 1 ) {
							
							$element.css( 'opacity', '' );
							
						}
						
					}
					
					// do callback
					
					if ( typeof callback === 'function' ) {
						
						callback();
						
					}
					
				};
			
			isInvisible = $element.is( '.invisible' );
			isHidden = $element.is( '.hiding, .hidden' ) || isInvisible;
			isCollapsed = $element.is( '.collapsed' );
			makeInvisible = isInvisible || parameters.invisible;
			
			// stop animations
			
			$element.stop( true ).removeClass( 'invisible hiding hidden collapsed' );
			
			$ignore = $element.find( 'a, button' ).add( $element );
			
			// if should start at 0 opacity
			
			if ( isHidden === true || isCollapsed === true || parameters.initHidden === true ) {
				
				$element.fadeTo( 0, 0 ).css( 'height', '' );
				
			}
			
			// handle opacity
			
			if ( opacity === 0 ) {
				
				$element.addClass( 'hiding' ).trigger( 'hide' );
				
				// temporarily disable all buttons and links
				
				dom_ignore_pointer( $ignore, true );
				
			}
			else {
				
				dom_ignore_pointer( $ignore, false );
				
				$element.trigger( 'show' );
				
			}
			
			$element.animate( { opacity: opacity }, { duration: duration, easing: easing, complete: fadeComplete } );
				
		} );
		
	}
	
	function dom_collapse( parameters ) {
		
		var $elements,
			duration,
			show,
			easing,
			callback;
		
		// handle parameters
		
		parameters = parameters || {};
		
		$elements = $( parameters.element );
		show = typeof parameters.show === 'boolean' ? parameters.show : false;
		duration = is_number( parameters.duration ) ? parameters.duration : shared.domCollapseDuration;
		easing = typeof parameters.easing === 'string' ? parameters.easing : shared.domCollapseEasing;
		callback = parameters.callback;
		
		// for each element
		
		$elements.each( function () {
			
			var $element = $( this ),
				$ignore,
				isCollapsed,
				isHidden,
				isInvisible,
				makeInvisible,
				heightCurrent,
				heightTarget = 0,
				collapseComplete = function () {
					
					// if shown or hidden
					
					if ( show === true ) {
						
						$element.css( 'height', '' ).trigger( 'shown' );
						
					}
					else {
						
						$element.addClass( makeInvisible ? 'invisible' : 'hidden' ).trigger( 'hidden' );
						
						// enable pointer
						
						dom_ignore_pointer( $ignore, false );
						
					}
					
					// do callback
					
					if ( typeof callback === 'function' ) {
						
						callback();
						
					}
					
				};
			
			// if should start from hidden
			
			isInvisible = $element.is( '.invisible' );
			isHidden = $element.is( '.hiding, .hidden' ) || isInvisible;
			isCollapsed = $element.is( '.collapsed' );
			makeInvisible = isInvisible || parameters.invisible;
			
			if ( isCollapsed !== true && ( isHidden === true || parameters.initHidden === true ) ) {
				
				$element.css( 'height', 0 ).css( 'opacity', '' );
				isCollapsed = true;
				
			}
			
			// if valid element and not already collapsing / collapsed to same state
			
			if ( isCollapsed === show ) {
				
				// stop any previous animation
				
				$element.stop( true ).removeClass( 'invisible hiding hidden collapsed' );
				
				$ignore = $element.find( 'a, button' ).add( $element );
				
				if ( show === true ) {
					
					// find correct current height and target height
					
					$element.placeholdme().appendTo( 'body' );
					
					heightCurrent = $element.height();
					$element.css( 'height', '' );
					heightTarget = $element.height();
					$element.css( 'height', heightCurrent );
					
					$element.placeholdme( 'revert' );
					
					// enable pointer
					
					dom_ignore_pointer( $ignore, false );
					
					// show
					
					$element.trigger( 'show' );
					
				}
				else {
					
					// temporarily ignore pointer
					
					dom_ignore_pointer( $ignore, true );
					
					$element.addClass( 'collapsed' ).trigger( 'hide' );
					
				}
				
				// animate
				
				$element.animate( { height: heightTarget }, { duration: duration, easing: easing, complete: collapseComplete } );
				
			}
			
		} );
		
	}
	
	/*===================================================
	
	worker
	
	=====================================================*/
	
	function worker_reset () {
		
		worker.tasksStarted = [];
		worker.tasksCompleted = [];
		
		shared.signals.onWorkerReset.dispatch();
		
	}
	
	function worker_task_start ( id ) {
		
		// if does not have task yet
		
		if ( typeof id === 'string' && id.length > 0 && worker.tasksStarted.hasOwnProperty( id ) !== true ) {
			
			worker.taskCount++;
			
			// store
			
			worker.tasksStarted.push( id );
			
			shared.signals.onWorkerTaskStarted.dispatch( id );
			
		}
		
	}
	
	function worker_task_complete ( id ) {
		
		var index = index_of_value( worker.tasksStarted, id );
		
		if ( index !== -1 ) {
			
			worker.tasksStarted.splice( index, 1 );
			worker.tasksCompleted.push( id );
			
			shared.signals.onWorkerTaskCompleted.dispatch( id );
			
			// check length of tasks started
			
			if ( worker.tasksStarted.length === 0 ) {
				
				shared.signals.onWorkerTasksCompleted.dispatch();
				
			}
			
		}
		
	}
	
	/*===================================================
	
	loading
	
	=====================================================*/
	
	function load ( locationsList, callbackList, listID, loadingMessage ) {
		
		var i, l,
			location,
			path,
			indexLoading,
			indexLoaded,
			allLocationsLoaded = true,
			assetData;
		
		if ( typeof locationsList !== 'undefined' ) {
			
			// get if list is not array
			
			if ( typeof locationsList === 'string' || locationsList.hasOwnProperty( 'length' ) === false ) {
				locationsList = [locationsList];
			}
			
			// make a copy of locations list
			
			locationsList = locationsList.slice( 0 );
			
			// handle list id
			
			if ( typeof listID !== 'string' ||  loader.listLocations.hasOwnProperty( listID )) {
				
				listID = loader.listCount;
				
			}
			
			// increase list count
			
			loader.listCount++;
			
			// permanent store of all loading
			
			for ( i = 0, l = locationsList.length; i < l; i++ ) {
				
				location = locationsList[ i ];
				
				path = get_asset_path( location );
				
				indexLoading = index_of_value( loader.loading, path );
				indexLoaded = index_of_value( loader.loaded, path );
				
				// if not already loading or loaded item
				// load new location
				if ( indexLoading === -1 && indexLoaded == -1 ) {
					
					loader.loading.push( path );
					
					loader.loadingListIDs.push( listID );
					
					worker_task_start( path );
					
					newLocations = true;
					
				}
				
				// if not yet loaded, mark list for loading
				
				if ( indexLoaded === -1 ) {
					
					allLocationsLoaded = false;
					
				}
				
			}
			
			loader.loadingOrLoaded = loader.loaded.concat( loader.loading );
			
			// temporary store locations
			
			loader.listLocations[listID] = locationsList;
			
			// temporary store callback list
			
			if ( typeof callbackList === 'undefined' ) {
				callbackList = [];
			}
			else if ( typeof callbackList === 'function' || callbackList.hasOwnProperty( 'length' ) === false ) {
				callbackList = [callbackList];
			}
			
			loader.listCallbacks[listID] = callbackList;
			
			// store load message
			
			if ( typeof loadingMessage !== 'string' ) {
				
				loadingMessage = loader.tips[ Math.max(0, Math.min(loader.tips.length - 1, Math.round(Math.random() * loader.tips.length) - 1)) ];
			}
			
			loader.listMessages[listID] = loadingMessage;
			
			// init new loaded array
			
			loader.listLoaded[listID] = [];
			
			// add list ID to lists to load
				
			loader.lists.push(listID);
			
			// if all locations in list are already loaded, skip loading process
			
			if ( allLocationsLoaded === true ) {
				
				list_completed( listID );
				
			}
			else {
				
				// start loading
				
				load_next_list();
				
			}
			
		}
		
	}
	
	function load_next_list () {
		
		var i, l,
			locationsList,
			location,
			path;
		
		// if any lists to load
		
		if ( loader.active === false && loader.lists.length > 0 ) {
			
			loader.active = true;
			
			// get next list 
			
			loader.listCurrent = loader.lists[ 0 ];
			
			// get locations, make copy because already loaded items will be removed from list immediately
			
			locationsList = loader.listLocations[loader.listCurrent].slice( 0 );
			
			// for each item location
			
			for (i = 0, l = locationsList.length; i < l; i += 1) {
				
				location = locationsList[ i ];
				
				path = get_asset_path( location );
				
				// if already loaded
				
				if ( index_of_value( loader.loaded, path ) !== -1 ) {
					
					// make duplicate complete event
					
					load_single_completed( location );
					
				}
				// if not started loading yet
				else if ( index_of_value( loader.started, path ) === -1 ) {
					
					// load it
					
					loader.started.push( path );
					
					load_single( location );
					
				}
				
			}
			
		}
		else {
			
			// no longer loading
			
			loader.listCurrent = undefined;
			
			shared.signals.onLoadAllCompleted.dispatch();
			
		}
		
	}
	
	function load_single ( location ) {
		var path, 
			ext, 
			loadType, 
			data,
			defaultCallback = function ( loadedData ) {
				
				if ( typeof loadedData !== 'undefined' ) {
					data = loadedData;
				}
				
				load_single_completed( location, data );
				
			},
			modelCallback = function ( geometry ) {
				load_single_completed( location, geometry );
			};
		
		if ( typeof location !== 'undefined' ) {
			
			// load based on type of location and file extension
			
			// LAB handles scripts (js)
			// THREE handles models (ascii/bin js)
			// images are native dom (jpg/png/gif/bmp)
			// jQuery handles JSON
			
			// get type
			
			loadType = location.type || loader.loadTypeBase;
			
			// get location path
			
			path = get_asset_path( location );
			
			// get extension
			
			ext = get_ext( path );
			
			// ensure path has extension
			
			if ( ext === '' ) {
				
				path = add_default_ext( path );
				
			}
			
			// type and/or extension check
			
			// image loading
			if ( loadType === 'image' || is_image_ext( ext ) ) {
				
				// load
				
				data = dom_generate_image( path, defaultCallback );
				
				// store empty image data in assets immediately
				
				asset_register( path, { data: data } );
				
			}
			// model loading via THREE
			else if ( loadType === 'model' ) {
				
				// init loader if needed
				
				if ( typeof loader.threeJSON === 'undefined' ) {
					loader.threeJSON = new THREE.JSONLoader( true );
				}
				
				loader.threeJSON.load( path, modelCallback );
				
			}
			// JSON loading
			else if ( loadType === 'json' ) {
				
				$.getJSON( path, defaultCallback );
				
			}
			// default to script loading
			else {
				
				$LAB.script( path ).wait( defaultCallback );
				
			}
			
		}
		
	}
	
	function load_single_completed ( location, data ) {
		var i, l,
			listID,
			locationsList,
			loadedList,
			index,
			path,
			loadType,
			listsCompleted;
		
		// get location path and type
		
		path = get_asset_path( location );
		
		loadType = get_load_type( location );
		
		// complete task
		
		worker_task_complete( path );
		
		// register asset
		
		asset_register( path, { data: data } );
		
		// add as loaded
		
		add_loaded_locations( path );
		
		// shared signal
		
		if (typeof shared !== 'undefined') {
			
			shared.signals.onLoadItemCompleted.dispatch( path );
			
		}
		
		// for each list loading
		
		for ( i = 0, l = loader.lists.length; i < l; i++ ) {
			
			listID = loader.lists[ i ];
			
			locationsList = loader.listLocations[ listID ];
			
			// get index in locations list
			
			index = index_of_value( locationsList,location);
			
			// if is in list
			
			if ( index !== -1 ) {
				
				loadedList = loader.listLoaded[ listID ];
				
				// remove location from locations list
				
				locationsList.splice(index, index !== -1 ? 1 : 0);
				
				// add location to loaded list
				
				loadedList.push( location );
				
				// if current list is complete, defer until all checked
				
				if ( locationsList.length === 0 ) {
					
					listsCompleted = listsCompleted || [];
					
					listsCompleted.push( listID );
					
				}
				
			}
			
		}
		
		// complete any completed lists
		if ( typeof listsCompleted !== 'undefined' ) {
			
			for ( i = 0, l = listsCompleted.length; i < l; i++ ) {
				
				list_completed( listsCompleted[ i ] );
				
			}
			
		}
		
	}
	
	function list_completed( listID ) {
		var i, l, 
			callbackList, 
			callback,
			listIndex;
		
		// remove list from all lists to load
		
		listIndex = index_of_value( loader.lists, listID );
		
		if ( listIndex !== -1 ) {
			
			loader.lists.splice( listIndex, 1 );
			
		}
		
		// do callbacks before clear
		
		callbackList = loader.listCallbacks[ listID ];
		
		for ( i = 0, l = callbackList.length; i < l; i++ ) {
			
			callback = callbackList[ i ];
			
			if ( typeof callback !== 'undefined' ) {
				
				callback.call( this );
				
			}
			
		}
		
		// shared signal
		
		if (typeof shared !== 'undefined') {
			
			shared.signals.onLoadListCompleted.dispatch( listID );
			
		}
		
		// clear
		
		delete loader.listLocations[ listID ];
		
		delete loader.listCallbacks[ listID ];
		
		delete loader.listMessages[ listID ];
		
		delete loader.listLoaded[ listID ];
		
		loader.active = false;
		
		// start next list
		
		load_next_list();
		
	}
	
	function add_loaded_locations ( locationsList ) {
		
		var i, l,
			location,
			path,
			indexLoaded,
			indexLoading,
			locationAdded = false;
		
		locationsList = to_array( locationsList );
		
		// for each location
		
		for ( i = 0, l = locationsList.length; i < l; i++ ) {
			
			location = locationsList[ i ];
			
			path = get_asset_path( location );
			
			// update all loading
			
			indexLoading = index_of_value( loader.loading, path );
			
			if ( indexLoading !== -1 ) {
				
				loader.loadingListIDs.splice( indexLoading, 1 );
				
				loader.loading.splice( indexLoading, 1 );
				
			}
			
			// update all loaded
			
			indexLoaded = index_of_value( loader.loaded, path );
			
			if ( indexLoaded === -1 ) {
				
				loader.loaded.push( path );
				
				locationAdded = true;
				
			}
			
		}
		
		if ( locationAdded === true ) {
			
			loader.loadingOrLoaded = loader.loaded.concat( loader.loading );
			
		}
		
	}
	
	function get_is_path_in_list ( location, list ) {
		
		var path,
			index;
		
		path = get_asset_path( location );
		
		index = index_of_value( list, path );
		
		if ( index !== -1 ) {
			
			return true;
			
		}
		else {
			
			return false;
			
		}
		
	}
	
	function get_is_loading_or_loaded ( location ) {
		
		return get_is_path_in_list( location, loader.loadingOrLoaded );
		
	}
	
	function get_is_loaded ( location ) {
		
		return get_is_path_in_list( location, loader.loaded );
		
	}
	
	function get_is_loading ( location ) {
		
		return get_is_path_in_list( location, loader.loading );
		
	}
	
	function get_load_type ( location ) {
		
		return location.type || loader.loadTypeBase;
		
	}
	
	/*===================================================
    
	loading helpers
    
    =====================================================*/
	
	function get_asset_path( location ) {
		
		return location.path || location;
		
	}
	
	function get_ext( location ) {
		
        var path, dotIndex, ext = '';
		
		path = get_asset_path( location );
        
        dotIndex = path.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            ext = path.substr( dotIndex + 1 ).toLowerCase();
        }
        
        return ext;
        
    }
	
	function add_default_ext( location ) {
		
		var path = remove_ext( location );
		
		path = path.replace(/\./g, "") + ".js";
		
		return path;
		
	}
	
	function remove_ext ( location ) {
		
		var path, dotIndex;
		
        path = get_asset_path( location );
        
        dotIndex = path.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            path = path.substr( 0, dotIndex );
        }
		
		return path;
		
	}
	
	function get_alt_path ( location ) {
		
		var path, ext;
		
		path = get_asset_path( location );
		ext = get_ext( path );
		
		// if has no extension, add default
		
		if ( ext === '' ) {
			
			return add_default_ext( path );
			
		}
		// if has extension, remove
		else {
			
			return remove_ext( path );
			
		}
		
	}
	
	/*===================================================
    
    asset handling
    
    =====================================================*/
	
	function asset_path_cascade( path ) {
		
		var i, l,
			cascade,
			part,
			dotIndex;
		
		// split path based on \ or /
		// each split is a parent module
		// last is actual module
		
		cascade = path.split(/[\\\/]/);
		
		for ( i = 0, l = cascade.length; i < l; i++ ) {
			
			part = cascade[ i ];
			
			// remove all non-alphanumeric
			
			part = part.replace(/[^\w\.\-]+/g, "");
			
			// cannot be empty
			
			if ( part === '' ) {
				
				on_error ( 'Invalid asset cascade', 'Main', 'N/A' );
				
				return;
				
			}
			
			cascade[ i ] = part;
			
		}
		
		return cascade;
		
	}
	
	function get_asset ( location, attempts ) {
		
		var path,
			cascade,
			parent,
			assetName,
			asset,
			i, l;
		
		// init parent and asset
		
		asset = parent = main;
		
		// cascade path
		
		path = get_asset_path( location );
		
		cascade = asset_path_cascade( path );
		
		// get asset
		
		for ( i = 0, l = cascade.length; i < l; i++ ) {
			
			// set as parent for next
			
			parent = asset;
			
			assetName = cascade[ i ];
			
			asset = parent[ assetName ];
			
			// if not a valid cascade point
			
			if ( typeof asset === 'undefined' ) {
				
				break;
				
			}
			
		}
		
		// check attempts
		
		attempts = attempts || 1;
		
		// if no asset and this is first attempt at finding
		if ( typeof asset === 'undefined' ) {
			
			// try again with alternate path
			
			if ( attempts === 1 ) {
				
				return get_asset( get_alt_path( path ), attempts + 1 );
				
			}
			
		}
		
		return asset;
		
	}
	
	function set_asset ( location, assetNew ) {
		
		var path,
			cascade,
			parent,
			assetName,
			asset,
			data,
			dataNew,
			i, l;
		
		// if new asset passed
		
		if ( assetNew instanceof GameAsset ) {
			
			// init parent and asset
			
			asset = parent = main;
			
			// cascade path
			
			path = get_asset_path( location );
			
			cascade = asset_path_cascade( path );
			
			// setup asset path
			
			for ( i = 0, l = cascade.length; i < l; i++ ) {
				
				// set as parent for next
				
				parent = asset;
				
				// get name of current point in cascade
				
				assetName = cascade[ i ];
				
				// get or build asset
				
				asset = parent[ assetName ] = parent[ assetName ] || {};
				
			}
			
			// if asset at path and is not empty
			
			if ( asset instanceof GameAsset && asset.is_empty() === false ) {
				
				// if new asset is not empty
				
				if ( assetNew.is_empty() === false ) {
					
					// merge new asset into current
					
					asset.merge_asset_self( assetNew );
					
				}
				
			}
			// else replace current empty asset with new asset
			else {
				
				parent[ assetName ] = asset = assetNew;
				
			}
			
		}
		
		return asset;
		
	}
	
	function get_asset_data ( location ) {
		
		var asset,
			data;
		
		// get asset at location
		
		asset = get_asset( location );
		
		// asset data, assume asset is data if not instance of asset
				
		data = ( asset instanceof GameAsset ) ? asset.data : asset;
		
		return data;
		
	}
	
	function asset_register( path, parameters ) {
		
		var assetNew,
			dataNew,
			assetCurrent = get_asset( path );
		
		if ( assetCurrent instanceof GameAsset !== true || ( parameters && typeof parameters.data !== 'undefined' && parameters.data !== assetCurrent.data ) ) {
			
			// initialize new asset
			
			assetNew = new GameAsset( path, parameters );
			
			dataNew = assetNew.data;
			
		}
		else {
			
			dataNew = assetCurrent.data;
			
		}
		
		// asset is usually only useful internally, return data instead
		
		return dataNew;
		
	}
	
	function asset_ready ( path, asset ) {
		
		var i, l;
		
		asset = asset || get_asset( path );
		
		if ( asset instanceof GameAsset ) {
			
			// ready and not waiting
			
			asset.ready = true;
			
			asset.wait = false;
			
			// dispatch signal
			
			if ( typeof shared.signals !== 'undefined' && typeof shared.signals.onAssetReady !== 'undefined' ) {
				
				shared.signals.onAssetReady.dispatch( path );
				
			}
			
		}
		
	}
	
	function asset_require( requirements, callbackList, waitForAssetsReady, assetSource ) {
		
		var callback_outer,
			on_asset_ready,
			on_all_assets_ready,
			assetsRequired = [],
			assetsWaitingFor = [],
			assetsReady = [],
			listeningForReadySignal = false;
		
		// get if arguments are not array
		
		requirements = to_array( requirements );
		
		callbackList = to_array( callbackList );
		
		// modify original callback to wrap in new function
		// that parses requirements and applies each asset as argument to callback
		// also handle if each asset required needs to be ready before triggering callback
		
		on_asset_ready = function ( path, secondAttempt ) {
			
			var indexWaiting;
			
			indexWaiting = index_of_value( assetsWaitingFor, path );
			
			// if waiting for asset to be ready
			
			if ( indexWaiting !== -1 ) {
				
				assetsWaitingFor.splice( indexWaiting, 1 );
				
				assetsReady.push( path );
				
				// check if no more to wait for
				
				if ( assetsWaitingFor.length === 0 && assetsReady.length === requirements.length ) {
					
					// remove signal
					
					if ( listeningForReadySignal === true ) {
						
						shared.signals.onAssetReady.remove( on_asset_ready );
						
						listeningForReadySignal = false;
						
					}
					
					on_all_assets_ready();
					
				}
				
			}
			// make one extra attempt with alternative path to check if waiting for asset to be ready
			else if ( secondAttempt !== true ) {
				
				on_asset_ready( get_alt_path( path ), true );
				
			}
			
		};
		
		on_all_assets_ready = function () {
			
			var i, l,
				callback;
			
			// apply all required assets to original callbacks
			
			for ( i = 0, l = callbackList.length; i < l; i++ ) {
				
				callback = callbackList[ i ];
				
				callback.apply( this, assetsRequired );
				
			}
			
			// if source asset passed and needs auto ready update
			
			if ( assetSource instanceof GameAsset && assetSource.readyAutoUpdate === true ) {
				
				assetSource.on_ready();
				
			}
			
		};
		
		callback_outer = function () {
			
			var i, l,
				location,
				path,
				asset;
			
			// find all assets
			
			for ( i = 0, l = requirements.length; i < l; i++ ) {
				
				location = requirements[ i ];
				
				path = get_asset_path( location );
				
				// get asset
				
				asset = get_asset( location );
				
				// add data to required list
				
				if ( asset instanceof GameAsset ) {
					
					assetsRequired.push( asset.data );
					
				}
				
				// if needed ready
				
				if ( waitForAssetsReady === true ) {
					
					assetsWaitingFor.push( path );
					
					// check ready status
					
					if ( asset instanceof GameAsset && asset.ready === true ) {
						
						on_asset_ready( path );
						
					}
					// asset not ready, listen for ready signal if not already
					else if ( listeningForReadySignal === false ) {
						
						listeningForReadySignal = true;
						
						shared.signals.onAssetReady.add( on_asset_ready );
						
					}
					
				}
				
			}
			
			// if not waiting for assets to be ready
			
			if ( waitForAssetsReady !== true || requirements.length === 0 ) {
				
				on_all_assets_ready();
				
			}
			
		};
		
		// pass all requirements to loader
		
		load( requirements, callback_outer );
		
	}
	
	/*===================================================
    
    asset instance
    
    =====================================================*/
	
	function GameAsset ( path, parameters ) {
		
		var assetNew = this;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.path = path;
		
		assetNew.merge_asset_self( parameters, true );
		
		// if asset has path
		
		if ( typeof assetNew.path !== 'undefined' ) {
			
			// store this new asset
			// returned asset from store is new asset merged into current asset if exists
			// or this new asset if no assets at path yet
			
			assetNew = set_asset( assetNew.path, assetNew );
			
			// regardless of storage results
			// handle this new asset's readiness and requirements
			
			if ( assetNew === this && this.readyAutoUpdate === true && ( this.requirements.length === 0 || this.wait !== true ) ) {
				
				this.on_ready();
				
			}
			
			if ( this.requirements.length > 0 ) {
				
				asset_require( this.requirements, this.callbacksOnReqs, this.wait, this );
			
			}
			
		}
		
		return assetNew;
		
	}
	
	GameAsset.prototype = {};
	
	GameAsset.prototype = {
		constructor: GameAsset,
		merge_asset_self: function ( asset, includeRequirements ) {
			
			var readyCallbackIndex;
			
			// TODO:
			// make sure merging accounts for new requirements and loading
			
			if ( typeof asset !== 'undefined' ) {
				
				this.path = asset.path;
				
				// merge asset data into this data
				
				this.merge_asset_data_self( asset );
				
				// if either asset is waiting
				
				if ( typeof this.wait !== 'boolean' || this.wait === false ) {
				
					if ( asset.wait === true ) {
						
						this.wait = asset.wait;
						
					}
					else {
						
						this.wait = false;
						
					}
					
				}
				
				// if asset is not ready
				
				if ( this.ready !== true ) {
					
					this.ready = false;
					
				}
				
				// requirements basics
				
				if ( typeof this.readyAutoUpdate !== 'boolean' ) {
				
					if ( asset.hasOwnProperty( 'readyAutoUpdate' ) ) {
						
						this.readyAutoUpdate = asset.readyAutoUpdate;
						
					}
					else {
						
						this.readyAutoUpdate = true;
						
					}
					
				}
				
				this.requirements = to_array( this.requirements );
				
				this.callbacksOnReqs = to_array( this.callbacksOnReqs );
				
				// if should also copy requirements
				
				if ( includeRequirements === true ) {
				
					this.requirements = this.requirements.concat( to_array( asset.requirements ) );
					
					this.callbacksOnReqs = this.callbacksOnReqs.concat( to_array( asset.callbacksOnReqs ) );
					
				}
				
			}
			
		},
		merge_asset_data_self: function ( source ) {
			
			var dataSrc = source.data;
			
			// if source data exists
			
			if ( typeof dataSrc !== 'undefined' ) {
				
				// if this data does not exist or source data is image, set as data instead of merging, as merging causes issues
				
				if ( typeof this.data === 'undefined' || is_image( dataSrc ) ) {
					
					this.data = dataSrc;
					
				}
				else {
					
					// copy properties of source asset data into this data
					// order is important to ensure this data remains an instance of whatever it is
					
					extend( dataSrc, this.data );
					
				}
				
			}
			
		},
		is_empty: function () {
			
			var isEmpty = true;
			
			if ( typeof this.data !== 'undefined' || ( this.ready === false && this.requirements.length > 0 ) ) {
				
				isEmpty = false;
				
			}
			
			return isEmpty;
			
		},
		on_ready: function () {
			//console.log( '[ KAIOPUA ] Module / Asset Ready: ' + this.path );
			asset_ready( this.path, this );
			
		}
	};
    
    return main; 
    
} ( KAIOPUA || {} ) );