
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model servicios
 * 
 */
export type servicios = $Result.DefaultSelection<Prisma.$serviciosPayload>
/**
 * Model productos
 * 
 */
export type productos = $Result.DefaultSelection<Prisma.$productosPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Servicios
 * const servicios = await prisma.servicios.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Servicios
   * const servicios = await prisma.servicios.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P]): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number }): $Utils.JsPromise<R>

  /**
   * Executes a raw MongoDB command and returns the result of it.
   * @example
   * ```
   * const user = await prisma.$runCommandRaw({
   *   aggregate: 'User',
   *   pipeline: [{ $match: { name: 'Bob' } }, { $project: { email: true, _id: false } }],
   *   explain: false,
   * })
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $runCommandRaw(command: Prisma.InputJsonObject): Prisma.PrismaPromise<Prisma.JsonObject>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.servicios`: Exposes CRUD operations for the **servicios** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Servicios
    * const servicios = await prisma.servicios.findMany()
    * ```
    */
  get servicios(): Prisma.serviciosDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.productos`: Exposes CRUD operations for the **productos** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Productos
    * const productos = await prisma.productos.findMany()
    * ```
    */
  get productos(): Prisma.productosDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.12.0
   * Query Engine version: 8047c96bbd92db98a2abc7c9323ce77c02c89dbc
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    servicios: 'servicios',
    productos: 'productos'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    dbOld?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "servicios" | "productos"
      txIsolationLevel: never
    }
    model: {
      servicios: {
        payload: Prisma.$serviciosPayload<ExtArgs>
        fields: Prisma.serviciosFieldRefs
        operations: {
          findUnique: {
            args: Prisma.serviciosFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$serviciosPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.serviciosFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$serviciosPayload>
          }
          findFirst: {
            args: Prisma.serviciosFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$serviciosPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.serviciosFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$serviciosPayload>
          }
          findMany: {
            args: Prisma.serviciosFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$serviciosPayload>[]
          }
          create: {
            args: Prisma.serviciosCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$serviciosPayload>
          }
          createMany: {
            args: Prisma.serviciosCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.serviciosDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$serviciosPayload>
          }
          update: {
            args: Prisma.serviciosUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$serviciosPayload>
          }
          deleteMany: {
            args: Prisma.serviciosDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.serviciosUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.serviciosUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$serviciosPayload>
          }
          aggregate: {
            args: Prisma.ServiciosAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateServicios>
          }
          groupBy: {
            args: Prisma.serviciosGroupByArgs<ExtArgs>
            result: $Utils.Optional<ServiciosGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.serviciosFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.serviciosAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.serviciosCountArgs<ExtArgs>
            result: $Utils.Optional<ServiciosCountAggregateOutputType> | number
          }
        }
      }
      productos: {
        payload: Prisma.$productosPayload<ExtArgs>
        fields: Prisma.productosFieldRefs
        operations: {
          findUnique: {
            args: Prisma.productosFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productosPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.productosFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productosPayload>
          }
          findFirst: {
            args: Prisma.productosFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productosPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.productosFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productosPayload>
          }
          findMany: {
            args: Prisma.productosFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productosPayload>[]
          }
          create: {
            args: Prisma.productosCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productosPayload>
          }
          createMany: {
            args: Prisma.productosCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.productosDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productosPayload>
          }
          update: {
            args: Prisma.productosUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productosPayload>
          }
          deleteMany: {
            args: Prisma.productosDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.productosUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.productosUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productosPayload>
          }
          aggregate: {
            args: Prisma.ProductosAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProductos>
          }
          groupBy: {
            args: Prisma.productosGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductosGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.productosFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.productosAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.productosCountArgs<ExtArgs>
            result: $Utils.Optional<ProductosCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $runCommandRaw: {
          args: Prisma.InputJsonObject,
          result: Prisma.JsonObject
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    servicios?: serviciosOmit
    productos?: productosOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model servicios
   */

  export type AggregateServicios = {
    _count: ServiciosCountAggregateOutputType | null
    _avg: ServiciosAvgAggregateOutputType | null
    _sum: ServiciosSumAggregateOutputType | null
    _min: ServiciosMinAggregateOutputType | null
    _max: ServiciosMaxAggregateOutputType | null
  }

  export type ServiciosAvgAggregateOutputType = {
    total: number | null
  }

  export type ServiciosSumAggregateOutputType = {
    total: number | null
  }

  export type ServiciosMinAggregateOutputType = {
    id: string | null
    cliente: string | null
    telefono1: string | null
    telefono2: string | null
    obsCliente: string | null
    categoria: string | null
    marca: string | null
    motivo: string | null
    total: number | null
    obsProducto: string | null
    sim: string | null
    sd: string | null
    estado: string | null
    obsTecnico: string | null
    fechaIn: Date | null
    fechaOut: Date | null
  }

  export type ServiciosMaxAggregateOutputType = {
    id: string | null
    cliente: string | null
    telefono1: string | null
    telefono2: string | null
    obsCliente: string | null
    categoria: string | null
    marca: string | null
    motivo: string | null
    total: number | null
    obsProducto: string | null
    sim: string | null
    sd: string | null
    estado: string | null
    obsTecnico: string | null
    fechaIn: Date | null
    fechaOut: Date | null
  }

  export type ServiciosCountAggregateOutputType = {
    id: number
    cliente: number
    telefono1: number
    telefono2: number
    obsCliente: number
    categoria: number
    marca: number
    motivo: number
    total: number
    pagos: number
    obsProducto: number
    contrasenia: number
    sim: number
    sd: number
    acc: number
    dato1: number
    dato2: number
    dato3: number
    estado: number
    obsTecnico: number
    fechaEstado: number
    fechaIn: number
    fechaOut: number
    _all: number
  }


  export type ServiciosAvgAggregateInputType = {
    total?: true
  }

  export type ServiciosSumAggregateInputType = {
    total?: true
  }

  export type ServiciosMinAggregateInputType = {
    id?: true
    cliente?: true
    telefono1?: true
    telefono2?: true
    obsCliente?: true
    categoria?: true
    marca?: true
    motivo?: true
    total?: true
    obsProducto?: true
    sim?: true
    sd?: true
    estado?: true
    obsTecnico?: true
    fechaIn?: true
    fechaOut?: true
  }

  export type ServiciosMaxAggregateInputType = {
    id?: true
    cliente?: true
    telefono1?: true
    telefono2?: true
    obsCliente?: true
    categoria?: true
    marca?: true
    motivo?: true
    total?: true
    obsProducto?: true
    sim?: true
    sd?: true
    estado?: true
    obsTecnico?: true
    fechaIn?: true
    fechaOut?: true
  }

  export type ServiciosCountAggregateInputType = {
    id?: true
    cliente?: true
    telefono1?: true
    telefono2?: true
    obsCliente?: true
    categoria?: true
    marca?: true
    motivo?: true
    total?: true
    pagos?: true
    obsProducto?: true
    contrasenia?: true
    sim?: true
    sd?: true
    acc?: true
    dato1?: true
    dato2?: true
    dato3?: true
    estado?: true
    obsTecnico?: true
    fechaEstado?: true
    fechaIn?: true
    fechaOut?: true
    _all?: true
  }

  export type ServiciosAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which servicios to aggregate.
     */
    where?: serviciosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of servicios to fetch.
     */
    orderBy?: serviciosOrderByWithRelationInput | serviciosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: serviciosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` servicios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` servicios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned servicios
    **/
    _count?: true | ServiciosCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ServiciosAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ServiciosSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ServiciosMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ServiciosMaxAggregateInputType
  }

  export type GetServiciosAggregateType<T extends ServiciosAggregateArgs> = {
        [P in keyof T & keyof AggregateServicios]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateServicios[P]>
      : GetScalarType<T[P], AggregateServicios[P]>
  }




  export type serviciosGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: serviciosWhereInput
    orderBy?: serviciosOrderByWithAggregationInput | serviciosOrderByWithAggregationInput[]
    by: ServiciosScalarFieldEnum[] | ServiciosScalarFieldEnum
    having?: serviciosScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ServiciosCountAggregateInputType | true
    _avg?: ServiciosAvgAggregateInputType
    _sum?: ServiciosSumAggregateInputType
    _min?: ServiciosMinAggregateInputType
    _max?: ServiciosMaxAggregateInputType
  }

  export type ServiciosGroupByOutputType = {
    id: string
    cliente: string | null
    telefono1: string | null
    telefono2: string | null
    obsCliente: string | null
    categoria: string | null
    marca: string | null
    motivo: string | null
    total: number | null
    pagos: JsonValue | null
    obsProducto: string | null
    contrasenia: JsonValue | null
    sim: string | null
    sd: string | null
    acc: JsonValue | null
    dato1: JsonValue | null
    dato2: JsonValue | null
    dato3: JsonValue | null
    estado: string | null
    obsTecnico: string | null
    fechaEstado: JsonValue | null
    fechaIn: Date | null
    fechaOut: Date | null
    _count: ServiciosCountAggregateOutputType | null
    _avg: ServiciosAvgAggregateOutputType | null
    _sum: ServiciosSumAggregateOutputType | null
    _min: ServiciosMinAggregateOutputType | null
    _max: ServiciosMaxAggregateOutputType | null
  }

  type GetServiciosGroupByPayload<T extends serviciosGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ServiciosGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ServiciosGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServiciosGroupByOutputType[P]>
            : GetScalarType<T[P], ServiciosGroupByOutputType[P]>
        }
      >
    >


  export type serviciosSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cliente?: boolean
    telefono1?: boolean
    telefono2?: boolean
    obsCliente?: boolean
    categoria?: boolean
    marca?: boolean
    motivo?: boolean
    total?: boolean
    pagos?: boolean
    obsProducto?: boolean
    contrasenia?: boolean
    sim?: boolean
    sd?: boolean
    acc?: boolean
    dato1?: boolean
    dato2?: boolean
    dato3?: boolean
    estado?: boolean
    obsTecnico?: boolean
    fechaEstado?: boolean
    fechaIn?: boolean
    fechaOut?: boolean
  }, ExtArgs["result"]["servicios"]>



  export type serviciosSelectScalar = {
    id?: boolean
    cliente?: boolean
    telefono1?: boolean
    telefono2?: boolean
    obsCliente?: boolean
    categoria?: boolean
    marca?: boolean
    motivo?: boolean
    total?: boolean
    pagos?: boolean
    obsProducto?: boolean
    contrasenia?: boolean
    sim?: boolean
    sd?: boolean
    acc?: boolean
    dato1?: boolean
    dato2?: boolean
    dato3?: boolean
    estado?: boolean
    obsTecnico?: boolean
    fechaEstado?: boolean
    fechaIn?: boolean
    fechaOut?: boolean
  }

  export type serviciosOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "cliente" | "telefono1" | "telefono2" | "obsCliente" | "categoria" | "marca" | "motivo" | "total" | "pagos" | "obsProducto" | "contrasenia" | "sim" | "sd" | "acc" | "dato1" | "dato2" | "dato3" | "estado" | "obsTecnico" | "fechaEstado" | "fechaIn" | "fechaOut", ExtArgs["result"]["servicios"]>

  export type $serviciosPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "servicios"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      cliente: string | null
      telefono1: string | null
      telefono2: string | null
      obsCliente: string | null
      categoria: string | null
      marca: string | null
      motivo: string | null
      total: number | null
      pagos: Prisma.JsonValue | null
      obsProducto: string | null
      contrasenia: Prisma.JsonValue | null
      sim: string | null
      sd: string | null
      acc: Prisma.JsonValue | null
      dato1: Prisma.JsonValue | null
      dato2: Prisma.JsonValue | null
      dato3: Prisma.JsonValue | null
      estado: string | null
      obsTecnico: string | null
      fechaEstado: Prisma.JsonValue | null
      fechaIn: Date | null
      fechaOut: Date | null
    }, ExtArgs["result"]["servicios"]>
    composites: {}
  }

  type serviciosGetPayload<S extends boolean | null | undefined | serviciosDefaultArgs> = $Result.GetResult<Prisma.$serviciosPayload, S>

  type serviciosCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<serviciosFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ServiciosCountAggregateInputType | true
    }

  export interface serviciosDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['servicios'], meta: { name: 'servicios' } }
    /**
     * Find zero or one Servicios that matches the filter.
     * @param {serviciosFindUniqueArgs} args - Arguments to find a Servicios
     * @example
     * // Get one Servicios
     * const servicios = await prisma.servicios.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends serviciosFindUniqueArgs>(args: SelectSubset<T, serviciosFindUniqueArgs<ExtArgs>>): Prisma__serviciosClient<$Result.GetResult<Prisma.$serviciosPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Servicios that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {serviciosFindUniqueOrThrowArgs} args - Arguments to find a Servicios
     * @example
     * // Get one Servicios
     * const servicios = await prisma.servicios.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends serviciosFindUniqueOrThrowArgs>(args: SelectSubset<T, serviciosFindUniqueOrThrowArgs<ExtArgs>>): Prisma__serviciosClient<$Result.GetResult<Prisma.$serviciosPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Servicios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {serviciosFindFirstArgs} args - Arguments to find a Servicios
     * @example
     * // Get one Servicios
     * const servicios = await prisma.servicios.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends serviciosFindFirstArgs>(args?: SelectSubset<T, serviciosFindFirstArgs<ExtArgs>>): Prisma__serviciosClient<$Result.GetResult<Prisma.$serviciosPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Servicios that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {serviciosFindFirstOrThrowArgs} args - Arguments to find a Servicios
     * @example
     * // Get one Servicios
     * const servicios = await prisma.servicios.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends serviciosFindFirstOrThrowArgs>(args?: SelectSubset<T, serviciosFindFirstOrThrowArgs<ExtArgs>>): Prisma__serviciosClient<$Result.GetResult<Prisma.$serviciosPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Servicios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {serviciosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Servicios
     * const servicios = await prisma.servicios.findMany()
     * 
     * // Get first 10 Servicios
     * const servicios = await prisma.servicios.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const serviciosWithIdOnly = await prisma.servicios.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends serviciosFindManyArgs>(args?: SelectSubset<T, serviciosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$serviciosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Servicios.
     * @param {serviciosCreateArgs} args - Arguments to create a Servicios.
     * @example
     * // Create one Servicios
     * const Servicios = await prisma.servicios.create({
     *   data: {
     *     // ... data to create a Servicios
     *   }
     * })
     * 
     */
    create<T extends serviciosCreateArgs>(args: SelectSubset<T, serviciosCreateArgs<ExtArgs>>): Prisma__serviciosClient<$Result.GetResult<Prisma.$serviciosPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Servicios.
     * @param {serviciosCreateManyArgs} args - Arguments to create many Servicios.
     * @example
     * // Create many Servicios
     * const servicios = await prisma.servicios.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends serviciosCreateManyArgs>(args?: SelectSubset<T, serviciosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Servicios.
     * @param {serviciosDeleteArgs} args - Arguments to delete one Servicios.
     * @example
     * // Delete one Servicios
     * const Servicios = await prisma.servicios.delete({
     *   where: {
     *     // ... filter to delete one Servicios
     *   }
     * })
     * 
     */
    delete<T extends serviciosDeleteArgs>(args: SelectSubset<T, serviciosDeleteArgs<ExtArgs>>): Prisma__serviciosClient<$Result.GetResult<Prisma.$serviciosPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Servicios.
     * @param {serviciosUpdateArgs} args - Arguments to update one Servicios.
     * @example
     * // Update one Servicios
     * const servicios = await prisma.servicios.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends serviciosUpdateArgs>(args: SelectSubset<T, serviciosUpdateArgs<ExtArgs>>): Prisma__serviciosClient<$Result.GetResult<Prisma.$serviciosPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Servicios.
     * @param {serviciosDeleteManyArgs} args - Arguments to filter Servicios to delete.
     * @example
     * // Delete a few Servicios
     * const { count } = await prisma.servicios.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends serviciosDeleteManyArgs>(args?: SelectSubset<T, serviciosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Servicios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {serviciosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Servicios
     * const servicios = await prisma.servicios.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends serviciosUpdateManyArgs>(args: SelectSubset<T, serviciosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Servicios.
     * @param {serviciosUpsertArgs} args - Arguments to update or create a Servicios.
     * @example
     * // Update or create a Servicios
     * const servicios = await prisma.servicios.upsert({
     *   create: {
     *     // ... data to create a Servicios
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Servicios we want to update
     *   }
     * })
     */
    upsert<T extends serviciosUpsertArgs>(args: SelectSubset<T, serviciosUpsertArgs<ExtArgs>>): Prisma__serviciosClient<$Result.GetResult<Prisma.$serviciosPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Servicios that matches the filter.
     * @param {serviciosFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const servicios = await prisma.servicios.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: serviciosFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Servicios.
     * @param {serviciosAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const servicios = await prisma.servicios.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: serviciosAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Servicios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {serviciosCountArgs} args - Arguments to filter Servicios to count.
     * @example
     * // Count the number of Servicios
     * const count = await prisma.servicios.count({
     *   where: {
     *     // ... the filter for the Servicios we want to count
     *   }
     * })
    **/
    count<T extends serviciosCountArgs>(
      args?: Subset<T, serviciosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ServiciosCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Servicios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiciosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ServiciosAggregateArgs>(args: Subset<T, ServiciosAggregateArgs>): Prisma.PrismaPromise<GetServiciosAggregateType<T>>

    /**
     * Group by Servicios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {serviciosGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends serviciosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: serviciosGroupByArgs['orderBy'] }
        : { orderBy?: serviciosGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, serviciosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiciosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the servicios model
   */
  readonly fields: serviciosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for servicios.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__serviciosClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the servicios model
   */
  interface serviciosFieldRefs {
    readonly id: FieldRef<"servicios", 'String'>
    readonly cliente: FieldRef<"servicios", 'String'>
    readonly telefono1: FieldRef<"servicios", 'String'>
    readonly telefono2: FieldRef<"servicios", 'String'>
    readonly obsCliente: FieldRef<"servicios", 'String'>
    readonly categoria: FieldRef<"servicios", 'String'>
    readonly marca: FieldRef<"servicios", 'String'>
    readonly motivo: FieldRef<"servicios", 'String'>
    readonly total: FieldRef<"servicios", 'Float'>
    readonly pagos: FieldRef<"servicios", 'Json'>
    readonly obsProducto: FieldRef<"servicios", 'String'>
    readonly contrasenia: FieldRef<"servicios", 'Json'>
    readonly sim: FieldRef<"servicios", 'String'>
    readonly sd: FieldRef<"servicios", 'String'>
    readonly acc: FieldRef<"servicios", 'Json'>
    readonly dato1: FieldRef<"servicios", 'Json'>
    readonly dato2: FieldRef<"servicios", 'Json'>
    readonly dato3: FieldRef<"servicios", 'Json'>
    readonly estado: FieldRef<"servicios", 'String'>
    readonly obsTecnico: FieldRef<"servicios", 'String'>
    readonly fechaEstado: FieldRef<"servicios", 'Json'>
    readonly fechaIn: FieldRef<"servicios", 'DateTime'>
    readonly fechaOut: FieldRef<"servicios", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * servicios findUnique
   */
  export type serviciosFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the servicios
     */
    select?: serviciosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the servicios
     */
    omit?: serviciosOmit<ExtArgs> | null
    /**
     * Filter, which servicios to fetch.
     */
    where: serviciosWhereUniqueInput
  }

  /**
   * servicios findUniqueOrThrow
   */
  export type serviciosFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the servicios
     */
    select?: serviciosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the servicios
     */
    omit?: serviciosOmit<ExtArgs> | null
    /**
     * Filter, which servicios to fetch.
     */
    where: serviciosWhereUniqueInput
  }

  /**
   * servicios findFirst
   */
  export type serviciosFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the servicios
     */
    select?: serviciosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the servicios
     */
    omit?: serviciosOmit<ExtArgs> | null
    /**
     * Filter, which servicios to fetch.
     */
    where?: serviciosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of servicios to fetch.
     */
    orderBy?: serviciosOrderByWithRelationInput | serviciosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for servicios.
     */
    cursor?: serviciosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` servicios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` servicios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of servicios.
     */
    distinct?: ServiciosScalarFieldEnum | ServiciosScalarFieldEnum[]
  }

  /**
   * servicios findFirstOrThrow
   */
  export type serviciosFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the servicios
     */
    select?: serviciosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the servicios
     */
    omit?: serviciosOmit<ExtArgs> | null
    /**
     * Filter, which servicios to fetch.
     */
    where?: serviciosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of servicios to fetch.
     */
    orderBy?: serviciosOrderByWithRelationInput | serviciosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for servicios.
     */
    cursor?: serviciosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` servicios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` servicios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of servicios.
     */
    distinct?: ServiciosScalarFieldEnum | ServiciosScalarFieldEnum[]
  }

  /**
   * servicios findMany
   */
  export type serviciosFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the servicios
     */
    select?: serviciosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the servicios
     */
    omit?: serviciosOmit<ExtArgs> | null
    /**
     * Filter, which servicios to fetch.
     */
    where?: serviciosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of servicios to fetch.
     */
    orderBy?: serviciosOrderByWithRelationInput | serviciosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing servicios.
     */
    cursor?: serviciosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` servicios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` servicios.
     */
    skip?: number
    distinct?: ServiciosScalarFieldEnum | ServiciosScalarFieldEnum[]
  }

  /**
   * servicios create
   */
  export type serviciosCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the servicios
     */
    select?: serviciosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the servicios
     */
    omit?: serviciosOmit<ExtArgs> | null
    /**
     * The data needed to create a servicios.
     */
    data?: XOR<serviciosCreateInput, serviciosUncheckedCreateInput>
  }

  /**
   * servicios createMany
   */
  export type serviciosCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many servicios.
     */
    data: serviciosCreateManyInput | serviciosCreateManyInput[]
  }

  /**
   * servicios update
   */
  export type serviciosUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the servicios
     */
    select?: serviciosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the servicios
     */
    omit?: serviciosOmit<ExtArgs> | null
    /**
     * The data needed to update a servicios.
     */
    data: XOR<serviciosUpdateInput, serviciosUncheckedUpdateInput>
    /**
     * Choose, which servicios to update.
     */
    where: serviciosWhereUniqueInput
  }

  /**
   * servicios updateMany
   */
  export type serviciosUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update servicios.
     */
    data: XOR<serviciosUpdateManyMutationInput, serviciosUncheckedUpdateManyInput>
    /**
     * Filter which servicios to update
     */
    where?: serviciosWhereInput
    /**
     * Limit how many servicios to update.
     */
    limit?: number
  }

  /**
   * servicios upsert
   */
  export type serviciosUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the servicios
     */
    select?: serviciosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the servicios
     */
    omit?: serviciosOmit<ExtArgs> | null
    /**
     * The filter to search for the servicios to update in case it exists.
     */
    where: serviciosWhereUniqueInput
    /**
     * In case the servicios found by the `where` argument doesn't exist, create a new servicios with this data.
     */
    create: XOR<serviciosCreateInput, serviciosUncheckedCreateInput>
    /**
     * In case the servicios was found with the provided `where` argument, update it with this data.
     */
    update: XOR<serviciosUpdateInput, serviciosUncheckedUpdateInput>
  }

  /**
   * servicios delete
   */
  export type serviciosDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the servicios
     */
    select?: serviciosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the servicios
     */
    omit?: serviciosOmit<ExtArgs> | null
    /**
     * Filter which servicios to delete.
     */
    where: serviciosWhereUniqueInput
  }

  /**
   * servicios deleteMany
   */
  export type serviciosDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which servicios to delete
     */
    where?: serviciosWhereInput
    /**
     * Limit how many servicios to delete.
     */
    limit?: number
  }

  /**
   * servicios findRaw
   */
  export type serviciosFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * servicios aggregateRaw
   */
  export type serviciosAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * servicios without action
   */
  export type serviciosDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the servicios
     */
    select?: serviciosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the servicios
     */
    omit?: serviciosOmit<ExtArgs> | null
  }


  /**
   * Model productos
   */

  export type AggregateProductos = {
    _count: ProductosCountAggregateOutputType | null
    _avg: ProductosAvgAggregateOutputType | null
    _sum: ProductosSumAggregateOutputType | null
    _min: ProductosMinAggregateOutputType | null
    _max: ProductosMaxAggregateOutputType | null
  }

  export type ProductosAvgAggregateOutputType = {
    codigo: number | null
    precioCompra: number | null
  }

  export type ProductosSumAggregateOutputType = {
    codigo: number | null
    precioCompra: number | null
  }

  export type ProductosMinAggregateOutputType = {
    id: string | null
    codigo: number | null
    categoria: string | null
    producto: string | null
    precioCompra: number | null
    proveedor: string | null
    detalles: string | null
    img: string | null
    fechaPrecioVenta: string | null
    fecha: Date | null
  }

  export type ProductosMaxAggregateOutputType = {
    id: string | null
    codigo: number | null
    categoria: string | null
    producto: string | null
    precioCompra: number | null
    proveedor: string | null
    detalles: string | null
    img: string | null
    fechaPrecioVenta: string | null
    fecha: Date | null
  }

  export type ProductosCountAggregateOutputType = {
    id: number
    codigo: number
    categoria: number
    producto: number
    precioCompra: number
    precioVenta: number
    stock: number
    proveedor: number
    detalles: number
    atributos: number
    img: number
    fechaPrecioVenta: number
    fecha: number
    _all: number
  }


  export type ProductosAvgAggregateInputType = {
    codigo?: true
    precioCompra?: true
  }

  export type ProductosSumAggregateInputType = {
    codigo?: true
    precioCompra?: true
  }

  export type ProductosMinAggregateInputType = {
    id?: true
    codigo?: true
    categoria?: true
    producto?: true
    precioCompra?: true
    proveedor?: true
    detalles?: true
    img?: true
    fechaPrecioVenta?: true
    fecha?: true
  }

  export type ProductosMaxAggregateInputType = {
    id?: true
    codigo?: true
    categoria?: true
    producto?: true
    precioCompra?: true
    proveedor?: true
    detalles?: true
    img?: true
    fechaPrecioVenta?: true
    fecha?: true
  }

  export type ProductosCountAggregateInputType = {
    id?: true
    codigo?: true
    categoria?: true
    producto?: true
    precioCompra?: true
    precioVenta?: true
    stock?: true
    proveedor?: true
    detalles?: true
    atributos?: true
    img?: true
    fechaPrecioVenta?: true
    fecha?: true
    _all?: true
  }

  export type ProductosAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which productos to aggregate.
     */
    where?: productosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of productos to fetch.
     */
    orderBy?: productosOrderByWithRelationInput | productosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: productosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` productos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` productos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned productos
    **/
    _count?: true | ProductosCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductosAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductosSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductosMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductosMaxAggregateInputType
  }

  export type GetProductosAggregateType<T extends ProductosAggregateArgs> = {
        [P in keyof T & keyof AggregateProductos]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProductos[P]>
      : GetScalarType<T[P], AggregateProductos[P]>
  }




  export type productosGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: productosWhereInput
    orderBy?: productosOrderByWithAggregationInput | productosOrderByWithAggregationInput[]
    by: ProductosScalarFieldEnum[] | ProductosScalarFieldEnum
    having?: productosScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductosCountAggregateInputType | true
    _avg?: ProductosAvgAggregateInputType
    _sum?: ProductosSumAggregateInputType
    _min?: ProductosMinAggregateInputType
    _max?: ProductosMaxAggregateInputType
  }

  export type ProductosGroupByOutputType = {
    id: string
    codigo: number | null
    categoria: string | null
    producto: string | null
    precioCompra: number | null
    precioVenta: JsonValue | null
    stock: JsonValue | null
    proveedor: string | null
    detalles: string | null
    atributos: JsonValue | null
    img: string | null
    fechaPrecioVenta: string | null
    fecha: Date | null
    _count: ProductosCountAggregateOutputType | null
    _avg: ProductosAvgAggregateOutputType | null
    _sum: ProductosSumAggregateOutputType | null
    _min: ProductosMinAggregateOutputType | null
    _max: ProductosMaxAggregateOutputType | null
  }

  type GetProductosGroupByPayload<T extends productosGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductosGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductosGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductosGroupByOutputType[P]>
            : GetScalarType<T[P], ProductosGroupByOutputType[P]>
        }
      >
    >


  export type productosSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    codigo?: boolean
    categoria?: boolean
    producto?: boolean
    precioCompra?: boolean
    precioVenta?: boolean
    stock?: boolean
    proveedor?: boolean
    detalles?: boolean
    atributos?: boolean
    img?: boolean
    fechaPrecioVenta?: boolean
    fecha?: boolean
  }, ExtArgs["result"]["productos"]>



  export type productosSelectScalar = {
    id?: boolean
    codigo?: boolean
    categoria?: boolean
    producto?: boolean
    precioCompra?: boolean
    precioVenta?: boolean
    stock?: boolean
    proveedor?: boolean
    detalles?: boolean
    atributos?: boolean
    img?: boolean
    fechaPrecioVenta?: boolean
    fecha?: boolean
  }

  export type productosOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "codigo" | "categoria" | "producto" | "precioCompra" | "precioVenta" | "stock" | "proveedor" | "detalles" | "atributos" | "img" | "fechaPrecioVenta" | "fecha", ExtArgs["result"]["productos"]>

  export type $productosPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "productos"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      codigo: number | null
      categoria: string | null
      producto: string | null
      precioCompra: number | null
      precioVenta: Prisma.JsonValue | null
      stock: Prisma.JsonValue | null
      proveedor: string | null
      detalles: string | null
      atributos: Prisma.JsonValue | null
      img: string | null
      fechaPrecioVenta: string | null
      fecha: Date | null
    }, ExtArgs["result"]["productos"]>
    composites: {}
  }

  type productosGetPayload<S extends boolean | null | undefined | productosDefaultArgs> = $Result.GetResult<Prisma.$productosPayload, S>

  type productosCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<productosFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductosCountAggregateInputType | true
    }

  export interface productosDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['productos'], meta: { name: 'productos' } }
    /**
     * Find zero or one Productos that matches the filter.
     * @param {productosFindUniqueArgs} args - Arguments to find a Productos
     * @example
     * // Get one Productos
     * const productos = await prisma.productos.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends productosFindUniqueArgs>(args: SelectSubset<T, productosFindUniqueArgs<ExtArgs>>): Prisma__productosClient<$Result.GetResult<Prisma.$productosPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Productos that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {productosFindUniqueOrThrowArgs} args - Arguments to find a Productos
     * @example
     * // Get one Productos
     * const productos = await prisma.productos.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends productosFindUniqueOrThrowArgs>(args: SelectSubset<T, productosFindUniqueOrThrowArgs<ExtArgs>>): Prisma__productosClient<$Result.GetResult<Prisma.$productosPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Productos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productosFindFirstArgs} args - Arguments to find a Productos
     * @example
     * // Get one Productos
     * const productos = await prisma.productos.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends productosFindFirstArgs>(args?: SelectSubset<T, productosFindFirstArgs<ExtArgs>>): Prisma__productosClient<$Result.GetResult<Prisma.$productosPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Productos that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productosFindFirstOrThrowArgs} args - Arguments to find a Productos
     * @example
     * // Get one Productos
     * const productos = await prisma.productos.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends productosFindFirstOrThrowArgs>(args?: SelectSubset<T, productosFindFirstOrThrowArgs<ExtArgs>>): Prisma__productosClient<$Result.GetResult<Prisma.$productosPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Productos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Productos
     * const productos = await prisma.productos.findMany()
     * 
     * // Get first 10 Productos
     * const productos = await prisma.productos.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productosWithIdOnly = await prisma.productos.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends productosFindManyArgs>(args?: SelectSubset<T, productosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Productos.
     * @param {productosCreateArgs} args - Arguments to create a Productos.
     * @example
     * // Create one Productos
     * const Productos = await prisma.productos.create({
     *   data: {
     *     // ... data to create a Productos
     *   }
     * })
     * 
     */
    create<T extends productosCreateArgs>(args: SelectSubset<T, productosCreateArgs<ExtArgs>>): Prisma__productosClient<$Result.GetResult<Prisma.$productosPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Productos.
     * @param {productosCreateManyArgs} args - Arguments to create many Productos.
     * @example
     * // Create many Productos
     * const productos = await prisma.productos.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends productosCreateManyArgs>(args?: SelectSubset<T, productosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Productos.
     * @param {productosDeleteArgs} args - Arguments to delete one Productos.
     * @example
     * // Delete one Productos
     * const Productos = await prisma.productos.delete({
     *   where: {
     *     // ... filter to delete one Productos
     *   }
     * })
     * 
     */
    delete<T extends productosDeleteArgs>(args: SelectSubset<T, productosDeleteArgs<ExtArgs>>): Prisma__productosClient<$Result.GetResult<Prisma.$productosPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Productos.
     * @param {productosUpdateArgs} args - Arguments to update one Productos.
     * @example
     * // Update one Productos
     * const productos = await prisma.productos.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends productosUpdateArgs>(args: SelectSubset<T, productosUpdateArgs<ExtArgs>>): Prisma__productosClient<$Result.GetResult<Prisma.$productosPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Productos.
     * @param {productosDeleteManyArgs} args - Arguments to filter Productos to delete.
     * @example
     * // Delete a few Productos
     * const { count } = await prisma.productos.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends productosDeleteManyArgs>(args?: SelectSubset<T, productosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Productos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Productos
     * const productos = await prisma.productos.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends productosUpdateManyArgs>(args: SelectSubset<T, productosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Productos.
     * @param {productosUpsertArgs} args - Arguments to update or create a Productos.
     * @example
     * // Update or create a Productos
     * const productos = await prisma.productos.upsert({
     *   create: {
     *     // ... data to create a Productos
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Productos we want to update
     *   }
     * })
     */
    upsert<T extends productosUpsertArgs>(args: SelectSubset<T, productosUpsertArgs<ExtArgs>>): Prisma__productosClient<$Result.GetResult<Prisma.$productosPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Productos that matches the filter.
     * @param {productosFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const productos = await prisma.productos.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: productosFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Productos.
     * @param {productosAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const productos = await prisma.productos.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: productosAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Productos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productosCountArgs} args - Arguments to filter Productos to count.
     * @example
     * // Count the number of Productos
     * const count = await prisma.productos.count({
     *   where: {
     *     // ... the filter for the Productos we want to count
     *   }
     * })
    **/
    count<T extends productosCountArgs>(
      args?: Subset<T, productosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductosCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Productos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductosAggregateArgs>(args: Subset<T, ProductosAggregateArgs>): Prisma.PrismaPromise<GetProductosAggregateType<T>>

    /**
     * Group by Productos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productosGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends productosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: productosGroupByArgs['orderBy'] }
        : { orderBy?: productosGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, productosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the productos model
   */
  readonly fields: productosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for productos.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__productosClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the productos model
   */
  interface productosFieldRefs {
    readonly id: FieldRef<"productos", 'String'>
    readonly codigo: FieldRef<"productos", 'Int'>
    readonly categoria: FieldRef<"productos", 'String'>
    readonly producto: FieldRef<"productos", 'String'>
    readonly precioCompra: FieldRef<"productos", 'Float'>
    readonly precioVenta: FieldRef<"productos", 'Json'>
    readonly stock: FieldRef<"productos", 'Json'>
    readonly proveedor: FieldRef<"productos", 'String'>
    readonly detalles: FieldRef<"productos", 'String'>
    readonly atributos: FieldRef<"productos", 'Json'>
    readonly img: FieldRef<"productos", 'String'>
    readonly fechaPrecioVenta: FieldRef<"productos", 'String'>
    readonly fecha: FieldRef<"productos", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * productos findUnique
   */
  export type productosFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the productos
     */
    select?: productosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the productos
     */
    omit?: productosOmit<ExtArgs> | null
    /**
     * Filter, which productos to fetch.
     */
    where: productosWhereUniqueInput
  }

  /**
   * productos findUniqueOrThrow
   */
  export type productosFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the productos
     */
    select?: productosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the productos
     */
    omit?: productosOmit<ExtArgs> | null
    /**
     * Filter, which productos to fetch.
     */
    where: productosWhereUniqueInput
  }

  /**
   * productos findFirst
   */
  export type productosFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the productos
     */
    select?: productosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the productos
     */
    omit?: productosOmit<ExtArgs> | null
    /**
     * Filter, which productos to fetch.
     */
    where?: productosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of productos to fetch.
     */
    orderBy?: productosOrderByWithRelationInput | productosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for productos.
     */
    cursor?: productosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` productos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` productos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of productos.
     */
    distinct?: ProductosScalarFieldEnum | ProductosScalarFieldEnum[]
  }

  /**
   * productos findFirstOrThrow
   */
  export type productosFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the productos
     */
    select?: productosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the productos
     */
    omit?: productosOmit<ExtArgs> | null
    /**
     * Filter, which productos to fetch.
     */
    where?: productosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of productos to fetch.
     */
    orderBy?: productosOrderByWithRelationInput | productosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for productos.
     */
    cursor?: productosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` productos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` productos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of productos.
     */
    distinct?: ProductosScalarFieldEnum | ProductosScalarFieldEnum[]
  }

  /**
   * productos findMany
   */
  export type productosFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the productos
     */
    select?: productosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the productos
     */
    omit?: productosOmit<ExtArgs> | null
    /**
     * Filter, which productos to fetch.
     */
    where?: productosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of productos to fetch.
     */
    orderBy?: productosOrderByWithRelationInput | productosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing productos.
     */
    cursor?: productosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` productos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` productos.
     */
    skip?: number
    distinct?: ProductosScalarFieldEnum | ProductosScalarFieldEnum[]
  }

  /**
   * productos create
   */
  export type productosCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the productos
     */
    select?: productosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the productos
     */
    omit?: productosOmit<ExtArgs> | null
    /**
     * The data needed to create a productos.
     */
    data?: XOR<productosCreateInput, productosUncheckedCreateInput>
  }

  /**
   * productos createMany
   */
  export type productosCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many productos.
     */
    data: productosCreateManyInput | productosCreateManyInput[]
  }

  /**
   * productos update
   */
  export type productosUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the productos
     */
    select?: productosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the productos
     */
    omit?: productosOmit<ExtArgs> | null
    /**
     * The data needed to update a productos.
     */
    data: XOR<productosUpdateInput, productosUncheckedUpdateInput>
    /**
     * Choose, which productos to update.
     */
    where: productosWhereUniqueInput
  }

  /**
   * productos updateMany
   */
  export type productosUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update productos.
     */
    data: XOR<productosUpdateManyMutationInput, productosUncheckedUpdateManyInput>
    /**
     * Filter which productos to update
     */
    where?: productosWhereInput
    /**
     * Limit how many productos to update.
     */
    limit?: number
  }

  /**
   * productos upsert
   */
  export type productosUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the productos
     */
    select?: productosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the productos
     */
    omit?: productosOmit<ExtArgs> | null
    /**
     * The filter to search for the productos to update in case it exists.
     */
    where: productosWhereUniqueInput
    /**
     * In case the productos found by the `where` argument doesn't exist, create a new productos with this data.
     */
    create: XOR<productosCreateInput, productosUncheckedCreateInput>
    /**
     * In case the productos was found with the provided `where` argument, update it with this data.
     */
    update: XOR<productosUpdateInput, productosUncheckedUpdateInput>
  }

  /**
   * productos delete
   */
  export type productosDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the productos
     */
    select?: productosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the productos
     */
    omit?: productosOmit<ExtArgs> | null
    /**
     * Filter which productos to delete.
     */
    where: productosWhereUniqueInput
  }

  /**
   * productos deleteMany
   */
  export type productosDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which productos to delete
     */
    where?: productosWhereInput
    /**
     * Limit how many productos to delete.
     */
    limit?: number
  }

  /**
   * productos findRaw
   */
  export type productosFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * productos aggregateRaw
   */
  export type productosAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * productos without action
   */
  export type productosDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the productos
     */
    select?: productosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the productos
     */
    omit?: productosOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const ServiciosScalarFieldEnum: {
    id: 'id',
    cliente: 'cliente',
    telefono1: 'telefono1',
    telefono2: 'telefono2',
    obsCliente: 'obsCliente',
    categoria: 'categoria',
    marca: 'marca',
    motivo: 'motivo',
    total: 'total',
    pagos: 'pagos',
    obsProducto: 'obsProducto',
    contrasenia: 'contrasenia',
    sim: 'sim',
    sd: 'sd',
    acc: 'acc',
    dato1: 'dato1',
    dato2: 'dato2',
    dato3: 'dato3',
    estado: 'estado',
    obsTecnico: 'obsTecnico',
    fechaEstado: 'fechaEstado',
    fechaIn: 'fechaIn',
    fechaOut: 'fechaOut'
  };

  export type ServiciosScalarFieldEnum = (typeof ServiciosScalarFieldEnum)[keyof typeof ServiciosScalarFieldEnum]


  export const ProductosScalarFieldEnum: {
    id: 'id',
    codigo: 'codigo',
    categoria: 'categoria',
    producto: 'producto',
    precioCompra: 'precioCompra',
    precioVenta: 'precioVenta',
    stock: 'stock',
    proveedor: 'proveedor',
    detalles: 'detalles',
    atributos: 'atributos',
    img: 'img',
    fechaPrecioVenta: 'fechaPrecioVenta',
    fecha: 'fecha'
  };

  export type ProductosScalarFieldEnum = (typeof ProductosScalarFieldEnum)[keyof typeof ProductosScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type serviciosWhereInput = {
    AND?: serviciosWhereInput | serviciosWhereInput[]
    OR?: serviciosWhereInput[]
    NOT?: serviciosWhereInput | serviciosWhereInput[]
    id?: StringFilter<"servicios"> | string
    cliente?: StringNullableFilter<"servicios"> | string | null
    telefono1?: StringNullableFilter<"servicios"> | string | null
    telefono2?: StringNullableFilter<"servicios"> | string | null
    obsCliente?: StringNullableFilter<"servicios"> | string | null
    categoria?: StringNullableFilter<"servicios"> | string | null
    marca?: StringNullableFilter<"servicios"> | string | null
    motivo?: StringNullableFilter<"servicios"> | string | null
    total?: FloatNullableFilter<"servicios"> | number | null
    pagos?: JsonNullableFilter<"servicios">
    obsProducto?: StringNullableFilter<"servicios"> | string | null
    contrasenia?: JsonNullableFilter<"servicios">
    sim?: StringNullableFilter<"servicios"> | string | null
    sd?: StringNullableFilter<"servicios"> | string | null
    acc?: JsonNullableFilter<"servicios">
    dato1?: JsonNullableFilter<"servicios">
    dato2?: JsonNullableFilter<"servicios">
    dato3?: JsonNullableFilter<"servicios">
    estado?: StringNullableFilter<"servicios"> | string | null
    obsTecnico?: StringNullableFilter<"servicios"> | string | null
    fechaEstado?: JsonNullableFilter<"servicios">
    fechaIn?: DateTimeNullableFilter<"servicios"> | Date | string | null
    fechaOut?: DateTimeNullableFilter<"servicios"> | Date | string | null
  }

  export type serviciosOrderByWithRelationInput = {
    id?: SortOrder
    cliente?: SortOrder
    telefono1?: SortOrder
    telefono2?: SortOrder
    obsCliente?: SortOrder
    categoria?: SortOrder
    marca?: SortOrder
    motivo?: SortOrder
    total?: SortOrder
    pagos?: SortOrder
    obsProducto?: SortOrder
    contrasenia?: SortOrder
    sim?: SortOrder
    sd?: SortOrder
    acc?: SortOrder
    dato1?: SortOrder
    dato2?: SortOrder
    dato3?: SortOrder
    estado?: SortOrder
    obsTecnico?: SortOrder
    fechaEstado?: SortOrder
    fechaIn?: SortOrder
    fechaOut?: SortOrder
  }

  export type serviciosWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: serviciosWhereInput | serviciosWhereInput[]
    OR?: serviciosWhereInput[]
    NOT?: serviciosWhereInput | serviciosWhereInput[]
    cliente?: StringNullableFilter<"servicios"> | string | null
    telefono1?: StringNullableFilter<"servicios"> | string | null
    telefono2?: StringNullableFilter<"servicios"> | string | null
    obsCliente?: StringNullableFilter<"servicios"> | string | null
    categoria?: StringNullableFilter<"servicios"> | string | null
    marca?: StringNullableFilter<"servicios"> | string | null
    motivo?: StringNullableFilter<"servicios"> | string | null
    total?: FloatNullableFilter<"servicios"> | number | null
    pagos?: JsonNullableFilter<"servicios">
    obsProducto?: StringNullableFilter<"servicios"> | string | null
    contrasenia?: JsonNullableFilter<"servicios">
    sim?: StringNullableFilter<"servicios"> | string | null
    sd?: StringNullableFilter<"servicios"> | string | null
    acc?: JsonNullableFilter<"servicios">
    dato1?: JsonNullableFilter<"servicios">
    dato2?: JsonNullableFilter<"servicios">
    dato3?: JsonNullableFilter<"servicios">
    estado?: StringNullableFilter<"servicios"> | string | null
    obsTecnico?: StringNullableFilter<"servicios"> | string | null
    fechaEstado?: JsonNullableFilter<"servicios">
    fechaIn?: DateTimeNullableFilter<"servicios"> | Date | string | null
    fechaOut?: DateTimeNullableFilter<"servicios"> | Date | string | null
  }, "id">

  export type serviciosOrderByWithAggregationInput = {
    id?: SortOrder
    cliente?: SortOrder
    telefono1?: SortOrder
    telefono2?: SortOrder
    obsCliente?: SortOrder
    categoria?: SortOrder
    marca?: SortOrder
    motivo?: SortOrder
    total?: SortOrder
    pagos?: SortOrder
    obsProducto?: SortOrder
    contrasenia?: SortOrder
    sim?: SortOrder
    sd?: SortOrder
    acc?: SortOrder
    dato1?: SortOrder
    dato2?: SortOrder
    dato3?: SortOrder
    estado?: SortOrder
    obsTecnico?: SortOrder
    fechaEstado?: SortOrder
    fechaIn?: SortOrder
    fechaOut?: SortOrder
    _count?: serviciosCountOrderByAggregateInput
    _avg?: serviciosAvgOrderByAggregateInput
    _max?: serviciosMaxOrderByAggregateInput
    _min?: serviciosMinOrderByAggregateInput
    _sum?: serviciosSumOrderByAggregateInput
  }

  export type serviciosScalarWhereWithAggregatesInput = {
    AND?: serviciosScalarWhereWithAggregatesInput | serviciosScalarWhereWithAggregatesInput[]
    OR?: serviciosScalarWhereWithAggregatesInput[]
    NOT?: serviciosScalarWhereWithAggregatesInput | serviciosScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"servicios"> | string
    cliente?: StringNullableWithAggregatesFilter<"servicios"> | string | null
    telefono1?: StringNullableWithAggregatesFilter<"servicios"> | string | null
    telefono2?: StringNullableWithAggregatesFilter<"servicios"> | string | null
    obsCliente?: StringNullableWithAggregatesFilter<"servicios"> | string | null
    categoria?: StringNullableWithAggregatesFilter<"servicios"> | string | null
    marca?: StringNullableWithAggregatesFilter<"servicios"> | string | null
    motivo?: StringNullableWithAggregatesFilter<"servicios"> | string | null
    total?: FloatNullableWithAggregatesFilter<"servicios"> | number | null
    pagos?: JsonNullableWithAggregatesFilter<"servicios">
    obsProducto?: StringNullableWithAggregatesFilter<"servicios"> | string | null
    contrasenia?: JsonNullableWithAggregatesFilter<"servicios">
    sim?: StringNullableWithAggregatesFilter<"servicios"> | string | null
    sd?: StringNullableWithAggregatesFilter<"servicios"> | string | null
    acc?: JsonNullableWithAggregatesFilter<"servicios">
    dato1?: JsonNullableWithAggregatesFilter<"servicios">
    dato2?: JsonNullableWithAggregatesFilter<"servicios">
    dato3?: JsonNullableWithAggregatesFilter<"servicios">
    estado?: StringNullableWithAggregatesFilter<"servicios"> | string | null
    obsTecnico?: StringNullableWithAggregatesFilter<"servicios"> | string | null
    fechaEstado?: JsonNullableWithAggregatesFilter<"servicios">
    fechaIn?: DateTimeNullableWithAggregatesFilter<"servicios"> | Date | string | null
    fechaOut?: DateTimeNullableWithAggregatesFilter<"servicios"> | Date | string | null
  }

  export type productosWhereInput = {
    AND?: productosWhereInput | productosWhereInput[]
    OR?: productosWhereInput[]
    NOT?: productosWhereInput | productosWhereInput[]
    id?: StringFilter<"productos"> | string
    codigo?: IntNullableFilter<"productos"> | number | null
    categoria?: StringNullableFilter<"productos"> | string | null
    producto?: StringNullableFilter<"productos"> | string | null
    precioCompra?: FloatNullableFilter<"productos"> | number | null
    precioVenta?: JsonNullableFilter<"productos">
    stock?: JsonNullableFilter<"productos">
    proveedor?: StringNullableFilter<"productos"> | string | null
    detalles?: StringNullableFilter<"productos"> | string | null
    atributos?: JsonNullableFilter<"productos">
    img?: StringNullableFilter<"productos"> | string | null
    fechaPrecioVenta?: StringNullableFilter<"productos"> | string | null
    fecha?: DateTimeNullableFilter<"productos"> | Date | string | null
  }

  export type productosOrderByWithRelationInput = {
    id?: SortOrder
    codigo?: SortOrder
    categoria?: SortOrder
    producto?: SortOrder
    precioCompra?: SortOrder
    precioVenta?: SortOrder
    stock?: SortOrder
    proveedor?: SortOrder
    detalles?: SortOrder
    atributos?: SortOrder
    img?: SortOrder
    fechaPrecioVenta?: SortOrder
    fecha?: SortOrder
  }

  export type productosWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: productosWhereInput | productosWhereInput[]
    OR?: productosWhereInput[]
    NOT?: productosWhereInput | productosWhereInput[]
    codigo?: IntNullableFilter<"productos"> | number | null
    categoria?: StringNullableFilter<"productos"> | string | null
    producto?: StringNullableFilter<"productos"> | string | null
    precioCompra?: FloatNullableFilter<"productos"> | number | null
    precioVenta?: JsonNullableFilter<"productos">
    stock?: JsonNullableFilter<"productos">
    proveedor?: StringNullableFilter<"productos"> | string | null
    detalles?: StringNullableFilter<"productos"> | string | null
    atributos?: JsonNullableFilter<"productos">
    img?: StringNullableFilter<"productos"> | string | null
    fechaPrecioVenta?: StringNullableFilter<"productos"> | string | null
    fecha?: DateTimeNullableFilter<"productos"> | Date | string | null
  }, "id">

  export type productosOrderByWithAggregationInput = {
    id?: SortOrder
    codigo?: SortOrder
    categoria?: SortOrder
    producto?: SortOrder
    precioCompra?: SortOrder
    precioVenta?: SortOrder
    stock?: SortOrder
    proveedor?: SortOrder
    detalles?: SortOrder
    atributos?: SortOrder
    img?: SortOrder
    fechaPrecioVenta?: SortOrder
    fecha?: SortOrder
    _count?: productosCountOrderByAggregateInput
    _avg?: productosAvgOrderByAggregateInput
    _max?: productosMaxOrderByAggregateInput
    _min?: productosMinOrderByAggregateInput
    _sum?: productosSumOrderByAggregateInput
  }

  export type productosScalarWhereWithAggregatesInput = {
    AND?: productosScalarWhereWithAggregatesInput | productosScalarWhereWithAggregatesInput[]
    OR?: productosScalarWhereWithAggregatesInput[]
    NOT?: productosScalarWhereWithAggregatesInput | productosScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"productos"> | string
    codigo?: IntNullableWithAggregatesFilter<"productos"> | number | null
    categoria?: StringNullableWithAggregatesFilter<"productos"> | string | null
    producto?: StringNullableWithAggregatesFilter<"productos"> | string | null
    precioCompra?: FloatNullableWithAggregatesFilter<"productos"> | number | null
    precioVenta?: JsonNullableWithAggregatesFilter<"productos">
    stock?: JsonNullableWithAggregatesFilter<"productos">
    proveedor?: StringNullableWithAggregatesFilter<"productos"> | string | null
    detalles?: StringNullableWithAggregatesFilter<"productos"> | string | null
    atributos?: JsonNullableWithAggregatesFilter<"productos">
    img?: StringNullableWithAggregatesFilter<"productos"> | string | null
    fechaPrecioVenta?: StringNullableWithAggregatesFilter<"productos"> | string | null
    fecha?: DateTimeNullableWithAggregatesFilter<"productos"> | Date | string | null
  }

  export type serviciosCreateInput = {
    id?: string
    cliente?: string | null
    telefono1?: string | null
    telefono2?: string | null
    obsCliente?: string | null
    categoria?: string | null
    marca?: string | null
    motivo?: string | null
    total?: number | null
    pagos?: InputJsonValue | null
    obsProducto?: string | null
    contrasenia?: InputJsonValue | null
    sim?: string | null
    sd?: string | null
    acc?: InputJsonValue | null
    dato1?: InputJsonValue | null
    dato2?: InputJsonValue | null
    dato3?: InputJsonValue | null
    estado?: string | null
    obsTecnico?: string | null
    fechaEstado?: InputJsonValue | null
    fechaIn?: Date | string | null
    fechaOut?: Date | string | null
  }

  export type serviciosUncheckedCreateInput = {
    id?: string
    cliente?: string | null
    telefono1?: string | null
    telefono2?: string | null
    obsCliente?: string | null
    categoria?: string | null
    marca?: string | null
    motivo?: string | null
    total?: number | null
    pagos?: InputJsonValue | null
    obsProducto?: string | null
    contrasenia?: InputJsonValue | null
    sim?: string | null
    sd?: string | null
    acc?: InputJsonValue | null
    dato1?: InputJsonValue | null
    dato2?: InputJsonValue | null
    dato3?: InputJsonValue | null
    estado?: string | null
    obsTecnico?: string | null
    fechaEstado?: InputJsonValue | null
    fechaIn?: Date | string | null
    fechaOut?: Date | string | null
  }

  export type serviciosUpdateInput = {
    cliente?: NullableStringFieldUpdateOperationsInput | string | null
    telefono1?: NullableStringFieldUpdateOperationsInput | string | null
    telefono2?: NullableStringFieldUpdateOperationsInput | string | null
    obsCliente?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    marca?: NullableStringFieldUpdateOperationsInput | string | null
    motivo?: NullableStringFieldUpdateOperationsInput | string | null
    total?: NullableFloatFieldUpdateOperationsInput | number | null
    pagos?: InputJsonValue | InputJsonValue | null
    obsProducto?: NullableStringFieldUpdateOperationsInput | string | null
    contrasenia?: InputJsonValue | InputJsonValue | null
    sim?: NullableStringFieldUpdateOperationsInput | string | null
    sd?: NullableStringFieldUpdateOperationsInput | string | null
    acc?: InputJsonValue | InputJsonValue | null
    dato1?: InputJsonValue | InputJsonValue | null
    dato2?: InputJsonValue | InputJsonValue | null
    dato3?: InputJsonValue | InputJsonValue | null
    estado?: NullableStringFieldUpdateOperationsInput | string | null
    obsTecnico?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEstado?: InputJsonValue | InputJsonValue | null
    fechaIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaOut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type serviciosUncheckedUpdateInput = {
    cliente?: NullableStringFieldUpdateOperationsInput | string | null
    telefono1?: NullableStringFieldUpdateOperationsInput | string | null
    telefono2?: NullableStringFieldUpdateOperationsInput | string | null
    obsCliente?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    marca?: NullableStringFieldUpdateOperationsInput | string | null
    motivo?: NullableStringFieldUpdateOperationsInput | string | null
    total?: NullableFloatFieldUpdateOperationsInput | number | null
    pagos?: InputJsonValue | InputJsonValue | null
    obsProducto?: NullableStringFieldUpdateOperationsInput | string | null
    contrasenia?: InputJsonValue | InputJsonValue | null
    sim?: NullableStringFieldUpdateOperationsInput | string | null
    sd?: NullableStringFieldUpdateOperationsInput | string | null
    acc?: InputJsonValue | InputJsonValue | null
    dato1?: InputJsonValue | InputJsonValue | null
    dato2?: InputJsonValue | InputJsonValue | null
    dato3?: InputJsonValue | InputJsonValue | null
    estado?: NullableStringFieldUpdateOperationsInput | string | null
    obsTecnico?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEstado?: InputJsonValue | InputJsonValue | null
    fechaIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaOut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type serviciosCreateManyInput = {
    id?: string
    cliente?: string | null
    telefono1?: string | null
    telefono2?: string | null
    obsCliente?: string | null
    categoria?: string | null
    marca?: string | null
    motivo?: string | null
    total?: number | null
    pagos?: InputJsonValue | null
    obsProducto?: string | null
    contrasenia?: InputJsonValue | null
    sim?: string | null
    sd?: string | null
    acc?: InputJsonValue | null
    dato1?: InputJsonValue | null
    dato2?: InputJsonValue | null
    dato3?: InputJsonValue | null
    estado?: string | null
    obsTecnico?: string | null
    fechaEstado?: InputJsonValue | null
    fechaIn?: Date | string | null
    fechaOut?: Date | string | null
  }

  export type serviciosUpdateManyMutationInput = {
    cliente?: NullableStringFieldUpdateOperationsInput | string | null
    telefono1?: NullableStringFieldUpdateOperationsInput | string | null
    telefono2?: NullableStringFieldUpdateOperationsInput | string | null
    obsCliente?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    marca?: NullableStringFieldUpdateOperationsInput | string | null
    motivo?: NullableStringFieldUpdateOperationsInput | string | null
    total?: NullableFloatFieldUpdateOperationsInput | number | null
    pagos?: InputJsonValue | InputJsonValue | null
    obsProducto?: NullableStringFieldUpdateOperationsInput | string | null
    contrasenia?: InputJsonValue | InputJsonValue | null
    sim?: NullableStringFieldUpdateOperationsInput | string | null
    sd?: NullableStringFieldUpdateOperationsInput | string | null
    acc?: InputJsonValue | InputJsonValue | null
    dato1?: InputJsonValue | InputJsonValue | null
    dato2?: InputJsonValue | InputJsonValue | null
    dato3?: InputJsonValue | InputJsonValue | null
    estado?: NullableStringFieldUpdateOperationsInput | string | null
    obsTecnico?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEstado?: InputJsonValue | InputJsonValue | null
    fechaIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaOut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type serviciosUncheckedUpdateManyInput = {
    cliente?: NullableStringFieldUpdateOperationsInput | string | null
    telefono1?: NullableStringFieldUpdateOperationsInput | string | null
    telefono2?: NullableStringFieldUpdateOperationsInput | string | null
    obsCliente?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    marca?: NullableStringFieldUpdateOperationsInput | string | null
    motivo?: NullableStringFieldUpdateOperationsInput | string | null
    total?: NullableFloatFieldUpdateOperationsInput | number | null
    pagos?: InputJsonValue | InputJsonValue | null
    obsProducto?: NullableStringFieldUpdateOperationsInput | string | null
    contrasenia?: InputJsonValue | InputJsonValue | null
    sim?: NullableStringFieldUpdateOperationsInput | string | null
    sd?: NullableStringFieldUpdateOperationsInput | string | null
    acc?: InputJsonValue | InputJsonValue | null
    dato1?: InputJsonValue | InputJsonValue | null
    dato2?: InputJsonValue | InputJsonValue | null
    dato3?: InputJsonValue | InputJsonValue | null
    estado?: NullableStringFieldUpdateOperationsInput | string | null
    obsTecnico?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEstado?: InputJsonValue | InputJsonValue | null
    fechaIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaOut?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type productosCreateInput = {
    id?: string
    codigo?: number | null
    categoria?: string | null
    producto?: string | null
    precioCompra?: number | null
    precioVenta?: InputJsonValue | null
    stock?: InputJsonValue | null
    proveedor?: string | null
    detalles?: string | null
    atributos?: InputJsonValue | null
    img?: string | null
    fechaPrecioVenta?: string | null
    fecha?: Date | string | null
  }

  export type productosUncheckedCreateInput = {
    id?: string
    codigo?: number | null
    categoria?: string | null
    producto?: string | null
    precioCompra?: number | null
    precioVenta?: InputJsonValue | null
    stock?: InputJsonValue | null
    proveedor?: string | null
    detalles?: string | null
    atributos?: InputJsonValue | null
    img?: string | null
    fechaPrecioVenta?: string | null
    fecha?: Date | string | null
  }

  export type productosUpdateInput = {
    codigo?: NullableIntFieldUpdateOperationsInput | number | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    producto?: NullableStringFieldUpdateOperationsInput | string | null
    precioCompra?: NullableFloatFieldUpdateOperationsInput | number | null
    precioVenta?: InputJsonValue | InputJsonValue | null
    stock?: InputJsonValue | InputJsonValue | null
    proveedor?: NullableStringFieldUpdateOperationsInput | string | null
    detalles?: NullableStringFieldUpdateOperationsInput | string | null
    atributos?: InputJsonValue | InputJsonValue | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaPrecioVenta?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type productosUncheckedUpdateInput = {
    codigo?: NullableIntFieldUpdateOperationsInput | number | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    producto?: NullableStringFieldUpdateOperationsInput | string | null
    precioCompra?: NullableFloatFieldUpdateOperationsInput | number | null
    precioVenta?: InputJsonValue | InputJsonValue | null
    stock?: InputJsonValue | InputJsonValue | null
    proveedor?: NullableStringFieldUpdateOperationsInput | string | null
    detalles?: NullableStringFieldUpdateOperationsInput | string | null
    atributos?: InputJsonValue | InputJsonValue | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaPrecioVenta?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type productosCreateManyInput = {
    id?: string
    codigo?: number | null
    categoria?: string | null
    producto?: string | null
    precioCompra?: number | null
    precioVenta?: InputJsonValue | null
    stock?: InputJsonValue | null
    proveedor?: string | null
    detalles?: string | null
    atributos?: InputJsonValue | null
    img?: string | null
    fechaPrecioVenta?: string | null
    fecha?: Date | string | null
  }

  export type productosUpdateManyMutationInput = {
    codigo?: NullableIntFieldUpdateOperationsInput | number | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    producto?: NullableStringFieldUpdateOperationsInput | string | null
    precioCompra?: NullableFloatFieldUpdateOperationsInput | number | null
    precioVenta?: InputJsonValue | InputJsonValue | null
    stock?: InputJsonValue | InputJsonValue | null
    proveedor?: NullableStringFieldUpdateOperationsInput | string | null
    detalles?: NullableStringFieldUpdateOperationsInput | string | null
    atributos?: InputJsonValue | InputJsonValue | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaPrecioVenta?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type productosUncheckedUpdateManyInput = {
    codigo?: NullableIntFieldUpdateOperationsInput | number | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    producto?: NullableStringFieldUpdateOperationsInput | string | null
    precioCompra?: NullableFloatFieldUpdateOperationsInput | number | null
    precioVenta?: InputJsonValue | InputJsonValue | null
    stock?: InputJsonValue | InputJsonValue | null
    proveedor?: NullableStringFieldUpdateOperationsInput | string | null
    detalles?: NullableStringFieldUpdateOperationsInput | string | null
    atributos?: InputJsonValue | InputJsonValue | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaPrecioVenta?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    isSet?: boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
    isSet?: boolean
  }

  export type serviciosCountOrderByAggregateInput = {
    id?: SortOrder
    cliente?: SortOrder
    telefono1?: SortOrder
    telefono2?: SortOrder
    obsCliente?: SortOrder
    categoria?: SortOrder
    marca?: SortOrder
    motivo?: SortOrder
    total?: SortOrder
    pagos?: SortOrder
    obsProducto?: SortOrder
    contrasenia?: SortOrder
    sim?: SortOrder
    sd?: SortOrder
    acc?: SortOrder
    dato1?: SortOrder
    dato2?: SortOrder
    dato3?: SortOrder
    estado?: SortOrder
    obsTecnico?: SortOrder
    fechaEstado?: SortOrder
    fechaIn?: SortOrder
    fechaOut?: SortOrder
  }

  export type serviciosAvgOrderByAggregateInput = {
    total?: SortOrder
  }

  export type serviciosMaxOrderByAggregateInput = {
    id?: SortOrder
    cliente?: SortOrder
    telefono1?: SortOrder
    telefono2?: SortOrder
    obsCliente?: SortOrder
    categoria?: SortOrder
    marca?: SortOrder
    motivo?: SortOrder
    total?: SortOrder
    obsProducto?: SortOrder
    sim?: SortOrder
    sd?: SortOrder
    estado?: SortOrder
    obsTecnico?: SortOrder
    fechaIn?: SortOrder
    fechaOut?: SortOrder
  }

  export type serviciosMinOrderByAggregateInput = {
    id?: SortOrder
    cliente?: SortOrder
    telefono1?: SortOrder
    telefono2?: SortOrder
    obsCliente?: SortOrder
    categoria?: SortOrder
    marca?: SortOrder
    motivo?: SortOrder
    total?: SortOrder
    obsProducto?: SortOrder
    sim?: SortOrder
    sd?: SortOrder
    estado?: SortOrder
    obsTecnico?: SortOrder
    fechaIn?: SortOrder
    fechaOut?: SortOrder
  }

  export type serviciosSumOrderByAggregateInput = {
    total?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
    isSet?: boolean
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }

  export type productosCountOrderByAggregateInput = {
    id?: SortOrder
    codigo?: SortOrder
    categoria?: SortOrder
    producto?: SortOrder
    precioCompra?: SortOrder
    precioVenta?: SortOrder
    stock?: SortOrder
    proveedor?: SortOrder
    detalles?: SortOrder
    atributos?: SortOrder
    img?: SortOrder
    fechaPrecioVenta?: SortOrder
    fecha?: SortOrder
  }

  export type productosAvgOrderByAggregateInput = {
    codigo?: SortOrder
    precioCompra?: SortOrder
  }

  export type productosMaxOrderByAggregateInput = {
    id?: SortOrder
    codigo?: SortOrder
    categoria?: SortOrder
    producto?: SortOrder
    precioCompra?: SortOrder
    proveedor?: SortOrder
    detalles?: SortOrder
    img?: SortOrder
    fechaPrecioVenta?: SortOrder
    fecha?: SortOrder
  }

  export type productosMinOrderByAggregateInput = {
    id?: SortOrder
    codigo?: SortOrder
    categoria?: SortOrder
    producto?: SortOrder
    precioCompra?: SortOrder
    proveedor?: SortOrder
    detalles?: SortOrder
    img?: SortOrder
    fechaPrecioVenta?: SortOrder
    fecha?: SortOrder
  }

  export type productosSumOrderByAggregateInput = {
    codigo?: SortOrder
    precioCompra?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
    unset?: boolean
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
    unset?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
    unset?: boolean
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
    unset?: boolean
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
    isSet?: boolean
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
    isSet?: boolean
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    isSet?: boolean
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
    isSet?: boolean
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}