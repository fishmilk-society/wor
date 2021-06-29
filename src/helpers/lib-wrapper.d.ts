/**
 * @file
 * This module provides type definitions for ‘lib-wrapper.’
 */

declare namespace libWrapper
{
    interface Options
    {
        /**
         * @param {boolean} options.chain [Optional] If 'true', the first parameter to 'fn' will be a function object that can be called to continue the chain.
         *   Default is 'false' if type=='OVERRIDE', otherwise 'true'.
         *   First introduced in v1.3.6.0.
         */
        chain?: boolean

        /*
         * @param {string} options.perf_mode [OPTIONAL] Selects the preferred performance mode for this wrapper. Default is 'AUTO'.
         *   It will be used if all other wrappers registered on the same target also prefer the same mode, otherwise the default will be used instead.
         *   This option should only be specified with good reason. In most cases, using 'AUTO' in order to allow the GM to choose is the best option.
         *   First introduced in v1.5.0.0.
         *
         *   The possible modes are:
         *
         *   'NORMAL':
         *     Enables all conflict detection capabilities provided by libWrapper. Slower than 'FAST'.
         *     Useful if wrapping a method commonly modified by other packages, to ensure most issues are detected.
         *     In most other cases, this mode is not recommended and 'AUTO' should be used instead.
         *
         *   'FAST':
         *     Disables some conflict detection capabilities provided by libWrapper, in exchange for performance. Faster than 'NORMAL'.
         *     Will guarantee wrapper call order and per-package prioritization, but fewer conflicts will be detectable.
         *     This performance mode will result in comparable performance to traditional non-libWrapper wrapping methods.
         *     Useful if wrapping a method called repeatedly in a tight loop, for example 'WallsLayer.testWall'.
         *     In most other cases, this mode is not recommended and 'AUTO' should be used instead.
         *
         *   'AUTO':
         *     Default performance mode. If unsure, choose this mode.
         *     Will allow the GM to choose which performance mode to use.
         *     Equivalent to 'FAST' when the libWrapper 'High-Performance Mode' setting is enabled by the GM, otherwise 'NORMAL'.
          */
        perf_mode?: 'NORMAL' | 'FAST' | 'AUTO'
    }

    /**
     * Register a new wrapper.
     * Important: If called before the 'init' hook, this method will fail.
     *
     * In addition to wrapping class methods, there is also support for wrapping methods on specific object instances, as well as class methods inherited from parent classes.
     * However, it is recommended to wrap methods directly in the class that defines them whenever possible, as inheritance/instance wrapping is less thoroughly tested and will incur a performance penalty.
     *
     * Triggers FVTT hook 'libWrapper.Register' when successful.
     *
     * @param {string} package_id  The package identifier, i.e. the 'id' field in your module/system/world's manifest.
     * @param {string} target      A string containing the path to the function you wish to add the wrapper to, starting at global scope, for example 'SightLayer.prototype.updateToken'.
     *                             This works for both normal methods, as well as properties with getters. To wrap a property's setter, append '#set' to the name, for example 'SightLayer.prototype.blurDistance#set'.
     * @param {function} fn        Wrapper function. The first argument will be the next function in the chain, except for 'OVERRIDE' wrappers.
     *                             The remaining arguments will correspond to the parameters passed to the wrapped method.
     * @param {string} type        [Optional] The type of the wrapper. Default is 'MIXED'.
     *
     *   The possible types are:
     *
     *   'WRAPPER':
     *     Use if your wrapper will *always* call the next function in the chain.
     *     This type has priority over every other type. It should be used whenever possible as it massively reduces the likelihood of conflicts.
     *     Note that the library will auto-detect if you use this type but do not call the original function, and automatically unregister your wrapper.
     *
     *   'MIXED':
     *     Default type. Your wrapper will be allowed to decide whether it should call the next function in the chain or not.
     *     These will always come after 'WRAPPER'-type wrappers. Order is not guaranteed, but conflicts will be auto-detected.
     *
     *   'OVERRIDE':
     *     Use if your wrapper will *never* call the next function in the chain. This type has the lowest priority, and will always be called last.
     *     If another package already has an 'OVERRIDE' wrapper registered to the same method, using this type will throw a <libWrapper.LibWrapperAlreadyOverriddenError> exception.
     *     Catching this exception should allow you to fail gracefully, and for example warn the user of the conflict.
     *     Note that if the GM has explicitly given your package priority over the existing one, no exception will be thrown and your wrapper will take over.
     *
     * @param {Object} options [Optional] Additional options to libWrapper.
     */
    export function register(package_id: string, target: string, fn: Function, type?: 'WRAPPER' | 'MIXED' | 'OVERRIDE', options?: Options): void
}
