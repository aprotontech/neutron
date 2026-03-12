/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const neutron = $root.neutron = (() => {

    /**
     * Namespace neutron.
     * @exports neutron
     * @namespace
     */
    const neutron = {};

    neutron.FileInformation = (function() {

        /**
         * Properties of a FileInformation.
         * @memberof neutron
         * @interface IFileInformation
         * @property {string|null} [name] FileInformation name
         * @property {boolean|null} [isDir] FileInformation isDir
         * @property {number|Long|null} [size] FileInformation size
         * @property {number|Long|null} [mtime] FileInformation mtime
         * @property {string|null} [mimeType] FileInformation mimeType
         * @property {Object.<string,google.protobuf.IValue>|null} [exifData] FileInformation exifData
         */

        /**
         * Constructs a new FileInformation.
         * @memberof neutron
         * @classdesc Represents a FileInformation.
         * @implements IFileInformation
         * @constructor
         * @param {neutron.IFileInformation=} [properties] Properties to set
         */
        function FileInformation(properties) {
            this.exifData = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FileInformation name.
         * @member {string} name
         * @memberof neutron.FileInformation
         * @instance
         */
        FileInformation.prototype.name = "";

        /**
         * FileInformation isDir.
         * @member {boolean} isDir
         * @memberof neutron.FileInformation
         * @instance
         */
        FileInformation.prototype.isDir = false;

        /**
         * FileInformation size.
         * @member {number|Long} size
         * @memberof neutron.FileInformation
         * @instance
         */
        FileInformation.prototype.size = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * FileInformation mtime.
         * @member {number|Long} mtime
         * @memberof neutron.FileInformation
         * @instance
         */
        FileInformation.prototype.mtime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * FileInformation mimeType.
         * @member {string} mimeType
         * @memberof neutron.FileInformation
         * @instance
         */
        FileInformation.prototype.mimeType = "";

        /**
         * FileInformation exifData.
         * @member {Object.<string,google.protobuf.IValue>} exifData
         * @memberof neutron.FileInformation
         * @instance
         */
        FileInformation.prototype.exifData = $util.emptyObject;

        /**
         * Creates a new FileInformation instance using the specified properties.
         * @function create
         * @memberof neutron.FileInformation
         * @static
         * @param {neutron.IFileInformation=} [properties] Properties to set
         * @returns {neutron.FileInformation} FileInformation instance
         */
        FileInformation.create = function create(properties) {
            return new FileInformation(properties);
        };

        /**
         * Encodes the specified FileInformation message. Does not implicitly {@link neutron.FileInformation.verify|verify} messages.
         * @function encode
         * @memberof neutron.FileInformation
         * @static
         * @param {neutron.IFileInformation} message FileInformation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FileInformation.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.isDir != null && Object.hasOwnProperty.call(message, "isDir"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isDir);
            if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.size);
            if (message.mtime != null && Object.hasOwnProperty.call(message, "mtime"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.mtime);
            if (message.mimeType != null && Object.hasOwnProperty.call(message, "mimeType"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.mimeType);
            if (message.exifData != null && Object.hasOwnProperty.call(message, "exifData"))
                for (let keys = Object.keys(message.exifData), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 6, wireType 2 =*/50).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.google.protobuf.Value.encode(message.exifData[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            return writer;
        };

        /**
         * Encodes the specified FileInformation message, length delimited. Does not implicitly {@link neutron.FileInformation.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.FileInformation
         * @static
         * @param {neutron.IFileInformation} message FileInformation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FileInformation.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FileInformation message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.FileInformation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.FileInformation} FileInformation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FileInformation.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.FileInformation(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 2: {
                        message.isDir = reader.bool();
                        break;
                    }
                case 3: {
                        message.size = reader.int64();
                        break;
                    }
                case 4: {
                        message.mtime = reader.int64();
                        break;
                    }
                case 5: {
                        message.mimeType = reader.string();
                        break;
                    }
                case 6: {
                        if (message.exifData === $util.emptyObject)
                            message.exifData = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.google.protobuf.Value.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.exifData[key] = value;
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a FileInformation message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.FileInformation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.FileInformation} FileInformation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FileInformation.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FileInformation message.
         * @function verify
         * @memberof neutron.FileInformation
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FileInformation.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.isDir != null && message.hasOwnProperty("isDir"))
                if (typeof message.isDir !== "boolean")
                    return "isDir: boolean expected";
            if (message.size != null && message.hasOwnProperty("size"))
                if (!$util.isInteger(message.size) && !(message.size && $util.isInteger(message.size.low) && $util.isInteger(message.size.high)))
                    return "size: integer|Long expected";
            if (message.mtime != null && message.hasOwnProperty("mtime"))
                if (!$util.isInteger(message.mtime) && !(message.mtime && $util.isInteger(message.mtime.low) && $util.isInteger(message.mtime.high)))
                    return "mtime: integer|Long expected";
            if (message.mimeType != null && message.hasOwnProperty("mimeType"))
                if (!$util.isString(message.mimeType))
                    return "mimeType: string expected";
            if (message.exifData != null && message.hasOwnProperty("exifData")) {
                if (!$util.isObject(message.exifData))
                    return "exifData: object expected";
                let key = Object.keys(message.exifData);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.google.protobuf.Value.verify(message.exifData[key[i]]);
                    if (error)
                        return "exifData." + error;
                }
            }
            return null;
        };

        /**
         * Creates a FileInformation message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.FileInformation
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.FileInformation} FileInformation
         */
        FileInformation.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.FileInformation)
                return object;
            let message = new $root.neutron.FileInformation();
            if (object.name != null)
                message.name = String(object.name);
            if (object.isDir != null)
                message.isDir = Boolean(object.isDir);
            if (object.size != null)
                if ($util.Long)
                    (message.size = $util.Long.fromValue(object.size)).unsigned = false;
                else if (typeof object.size === "string")
                    message.size = parseInt(object.size, 10);
                else if (typeof object.size === "number")
                    message.size = object.size;
                else if (typeof object.size === "object")
                    message.size = new $util.LongBits(object.size.low >>> 0, object.size.high >>> 0).toNumber();
            if (object.mtime != null)
                if ($util.Long)
                    (message.mtime = $util.Long.fromValue(object.mtime)).unsigned = false;
                else if (typeof object.mtime === "string")
                    message.mtime = parseInt(object.mtime, 10);
                else if (typeof object.mtime === "number")
                    message.mtime = object.mtime;
                else if (typeof object.mtime === "object")
                    message.mtime = new $util.LongBits(object.mtime.low >>> 0, object.mtime.high >>> 0).toNumber();
            if (object.mimeType != null)
                message.mimeType = String(object.mimeType);
            if (object.exifData) {
                if (typeof object.exifData !== "object")
                    throw TypeError(".neutron.FileInformation.exifData: object expected");
                message.exifData = {};
                for (let keys = Object.keys(object.exifData), i = 0; i < keys.length; ++i) {
                    if (typeof object.exifData[keys[i]] !== "object")
                        throw TypeError(".neutron.FileInformation.exifData: object expected");
                    message.exifData[keys[i]] = $root.google.protobuf.Value.fromObject(object.exifData[keys[i]]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a FileInformation message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.FileInformation
         * @static
         * @param {neutron.FileInformation} message FileInformation
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FileInformation.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.exifData = {};
            if (options.defaults) {
                object.name = "";
                object.isDir = false;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.size = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.size = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.mtime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.mtime = options.longs === String ? "0" : 0;
                object.mimeType = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.isDir != null && message.hasOwnProperty("isDir"))
                object.isDir = message.isDir;
            if (message.size != null && message.hasOwnProperty("size"))
                if (typeof message.size === "number")
                    object.size = options.longs === String ? String(message.size) : message.size;
                else
                    object.size = options.longs === String ? $util.Long.prototype.toString.call(message.size) : options.longs === Number ? new $util.LongBits(message.size.low >>> 0, message.size.high >>> 0).toNumber() : message.size;
            if (message.mtime != null && message.hasOwnProperty("mtime"))
                if (typeof message.mtime === "number")
                    object.mtime = options.longs === String ? String(message.mtime) : message.mtime;
                else
                    object.mtime = options.longs === String ? $util.Long.prototype.toString.call(message.mtime) : options.longs === Number ? new $util.LongBits(message.mtime.low >>> 0, message.mtime.high >>> 0).toNumber() : message.mtime;
            if (message.mimeType != null && message.hasOwnProperty("mimeType"))
                object.mimeType = message.mimeType;
            let keys2;
            if (message.exifData && (keys2 = Object.keys(message.exifData)).length) {
                object.exifData = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.exifData[keys2[j]] = $root.google.protobuf.Value.toObject(message.exifData[keys2[j]], options);
            }
            return object;
        };

        /**
         * Converts this FileInformation to JSON.
         * @function toJSON
         * @memberof neutron.FileInformation
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FileInformation.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FileInformation
         * @function getTypeUrl
         * @memberof neutron.FileInformation
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FileInformation.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.FileInformation";
        };

        return FileInformation;
    })();

    neutron.ImageRepoHistoryRequest = (function() {

        /**
         * Properties of an ImageRepoHistoryRequest.
         * @memberof neutron
         * @interface IImageRepoHistoryRequest
         * @property {Array.<string>|null} [types] ImageRepoHistoryRequest types
         * @property {number|Long|null} [lastId] ImageRepoHistoryRequest lastId
         * @property {number|null} [count] ImageRepoHistoryRequest count
         * @property {number|null} [order] ImageRepoHistoryRequest order
         * @property {string|null} [version] ImageRepoHistoryRequest version
         */

        /**
         * Constructs a new ImageRepoHistoryRequest.
         * @memberof neutron
         * @classdesc Represents an ImageRepoHistoryRequest.
         * @implements IImageRepoHistoryRequest
         * @constructor
         * @param {neutron.IImageRepoHistoryRequest=} [properties] Properties to set
         */
        function ImageRepoHistoryRequest(properties) {
            this.types = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ImageRepoHistoryRequest types.
         * @member {Array.<string>} types
         * @memberof neutron.ImageRepoHistoryRequest
         * @instance
         */
        ImageRepoHistoryRequest.prototype.types = $util.emptyArray;

        /**
         * ImageRepoHistoryRequest lastId.
         * @member {number|Long} lastId
         * @memberof neutron.ImageRepoHistoryRequest
         * @instance
         */
        ImageRepoHistoryRequest.prototype.lastId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * ImageRepoHistoryRequest count.
         * @member {number} count
         * @memberof neutron.ImageRepoHistoryRequest
         * @instance
         */
        ImageRepoHistoryRequest.prototype.count = 0;

        /**
         * ImageRepoHistoryRequest order.
         * @member {number} order
         * @memberof neutron.ImageRepoHistoryRequest
         * @instance
         */
        ImageRepoHistoryRequest.prototype.order = 0;

        /**
         * ImageRepoHistoryRequest version.
         * @member {string} version
         * @memberof neutron.ImageRepoHistoryRequest
         * @instance
         */
        ImageRepoHistoryRequest.prototype.version = "";

        /**
         * Creates a new ImageRepoHistoryRequest instance using the specified properties.
         * @function create
         * @memberof neutron.ImageRepoHistoryRequest
         * @static
         * @param {neutron.IImageRepoHistoryRequest=} [properties] Properties to set
         * @returns {neutron.ImageRepoHistoryRequest} ImageRepoHistoryRequest instance
         */
        ImageRepoHistoryRequest.create = function create(properties) {
            return new ImageRepoHistoryRequest(properties);
        };

        /**
         * Encodes the specified ImageRepoHistoryRequest message. Does not implicitly {@link neutron.ImageRepoHistoryRequest.verify|verify} messages.
         * @function encode
         * @memberof neutron.ImageRepoHistoryRequest
         * @static
         * @param {neutron.IImageRepoHistoryRequest} message ImageRepoHistoryRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ImageRepoHistoryRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.types != null && message.types.length)
                for (let i = 0; i < message.types.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.types[i]);
            if (message.lastId != null && Object.hasOwnProperty.call(message, "lastId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.lastId);
            if (message.count != null && Object.hasOwnProperty.call(message, "count"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.count);
            if (message.order != null && Object.hasOwnProperty.call(message, "order"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.order);
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.version);
            return writer;
        };

        /**
         * Encodes the specified ImageRepoHistoryRequest message, length delimited. Does not implicitly {@link neutron.ImageRepoHistoryRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.ImageRepoHistoryRequest
         * @static
         * @param {neutron.IImageRepoHistoryRequest} message ImageRepoHistoryRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ImageRepoHistoryRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ImageRepoHistoryRequest message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.ImageRepoHistoryRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.ImageRepoHistoryRequest} ImageRepoHistoryRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ImageRepoHistoryRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.ImageRepoHistoryRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.types && message.types.length))
                            message.types = [];
                        message.types.push(reader.string());
                        break;
                    }
                case 2: {
                        message.lastId = reader.int64();
                        break;
                    }
                case 3: {
                        message.count = reader.int32();
                        break;
                    }
                case 4: {
                        message.order = reader.int32();
                        break;
                    }
                case 5: {
                        message.version = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ImageRepoHistoryRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.ImageRepoHistoryRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.ImageRepoHistoryRequest} ImageRepoHistoryRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ImageRepoHistoryRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ImageRepoHistoryRequest message.
         * @function verify
         * @memberof neutron.ImageRepoHistoryRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ImageRepoHistoryRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.types != null && message.hasOwnProperty("types")) {
                if (!Array.isArray(message.types))
                    return "types: array expected";
                for (let i = 0; i < message.types.length; ++i)
                    if (!$util.isString(message.types[i]))
                        return "types: string[] expected";
            }
            if (message.lastId != null && message.hasOwnProperty("lastId"))
                if (!$util.isInteger(message.lastId) && !(message.lastId && $util.isInteger(message.lastId.low) && $util.isInteger(message.lastId.high)))
                    return "lastId: integer|Long expected";
            if (message.count != null && message.hasOwnProperty("count"))
                if (!$util.isInteger(message.count))
                    return "count: integer expected";
            if (message.order != null && message.hasOwnProperty("order"))
                if (!$util.isInteger(message.order))
                    return "order: integer expected";
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isString(message.version))
                    return "version: string expected";
            return null;
        };

        /**
         * Creates an ImageRepoHistoryRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.ImageRepoHistoryRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.ImageRepoHistoryRequest} ImageRepoHistoryRequest
         */
        ImageRepoHistoryRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.ImageRepoHistoryRequest)
                return object;
            let message = new $root.neutron.ImageRepoHistoryRequest();
            if (object.types) {
                if (!Array.isArray(object.types))
                    throw TypeError(".neutron.ImageRepoHistoryRequest.types: array expected");
                message.types = [];
                for (let i = 0; i < object.types.length; ++i)
                    message.types[i] = String(object.types[i]);
            }
            if (object.lastId != null)
                if ($util.Long)
                    (message.lastId = $util.Long.fromValue(object.lastId)).unsigned = false;
                else if (typeof object.lastId === "string")
                    message.lastId = parseInt(object.lastId, 10);
                else if (typeof object.lastId === "number")
                    message.lastId = object.lastId;
                else if (typeof object.lastId === "object")
                    message.lastId = new $util.LongBits(object.lastId.low >>> 0, object.lastId.high >>> 0).toNumber();
            if (object.count != null)
                message.count = object.count | 0;
            if (object.order != null)
                message.order = object.order | 0;
            if (object.version != null)
                message.version = String(object.version);
            return message;
        };

        /**
         * Creates a plain object from an ImageRepoHistoryRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.ImageRepoHistoryRequest
         * @static
         * @param {neutron.ImageRepoHistoryRequest} message ImageRepoHistoryRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ImageRepoHistoryRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.types = [];
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.lastId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.lastId = options.longs === String ? "0" : 0;
                object.count = 0;
                object.order = 0;
                object.version = "";
            }
            if (message.types && message.types.length) {
                object.types = [];
                for (let j = 0; j < message.types.length; ++j)
                    object.types[j] = message.types[j];
            }
            if (message.lastId != null && message.hasOwnProperty("lastId"))
                if (typeof message.lastId === "number")
                    object.lastId = options.longs === String ? String(message.lastId) : message.lastId;
                else
                    object.lastId = options.longs === String ? $util.Long.prototype.toString.call(message.lastId) : options.longs === Number ? new $util.LongBits(message.lastId.low >>> 0, message.lastId.high >>> 0).toNumber() : message.lastId;
            if (message.count != null && message.hasOwnProperty("count"))
                object.count = message.count;
            if (message.order != null && message.hasOwnProperty("order"))
                object.order = message.order;
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            return object;
        };

        /**
         * Converts this ImageRepoHistoryRequest to JSON.
         * @function toJSON
         * @memberof neutron.ImageRepoHistoryRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ImageRepoHistoryRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ImageRepoHistoryRequest
         * @function getTypeUrl
         * @memberof neutron.ImageRepoHistoryRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ImageRepoHistoryRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.ImageRepoHistoryRequest";
        };

        return ImageRepoHistoryRequest;
    })();

    neutron.ImageRepoHistoryItem = (function() {

        /**
         * Properties of an ImageRepoHistoryItem.
         * @memberof neutron
         * @interface IImageRepoHistoryItem
         * @property {number|Long|null} [id] ImageRepoHistoryItem id
         * @property {string|null} [path] ImageRepoHistoryItem path
         * @property {number|null} [type] ImageRepoHistoryItem type
         * @property {number|Long|null} [etime] ImageRepoHistoryItem etime
         * @property {number|Long|null} [mtime] ImageRepoHistoryItem mtime
         * @property {Object.<string,google.protobuf.IValue>|null} [exifData] ImageRepoHistoryItem exifData
         */

        /**
         * Constructs a new ImageRepoHistoryItem.
         * @memberof neutron
         * @classdesc Represents an ImageRepoHistoryItem.
         * @implements IImageRepoHistoryItem
         * @constructor
         * @param {neutron.IImageRepoHistoryItem=} [properties] Properties to set
         */
        function ImageRepoHistoryItem(properties) {
            this.exifData = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ImageRepoHistoryItem id.
         * @member {number|Long} id
         * @memberof neutron.ImageRepoHistoryItem
         * @instance
         */
        ImageRepoHistoryItem.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * ImageRepoHistoryItem path.
         * @member {string} path
         * @memberof neutron.ImageRepoHistoryItem
         * @instance
         */
        ImageRepoHistoryItem.prototype.path = "";

        /**
         * ImageRepoHistoryItem type.
         * @member {number} type
         * @memberof neutron.ImageRepoHistoryItem
         * @instance
         */
        ImageRepoHistoryItem.prototype.type = 0;

        /**
         * ImageRepoHistoryItem etime.
         * @member {number|Long} etime
         * @memberof neutron.ImageRepoHistoryItem
         * @instance
         */
        ImageRepoHistoryItem.prototype.etime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * ImageRepoHistoryItem mtime.
         * @member {number|Long} mtime
         * @memberof neutron.ImageRepoHistoryItem
         * @instance
         */
        ImageRepoHistoryItem.prototype.mtime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * ImageRepoHistoryItem exifData.
         * @member {Object.<string,google.protobuf.IValue>} exifData
         * @memberof neutron.ImageRepoHistoryItem
         * @instance
         */
        ImageRepoHistoryItem.prototype.exifData = $util.emptyObject;

        /**
         * Creates a new ImageRepoHistoryItem instance using the specified properties.
         * @function create
         * @memberof neutron.ImageRepoHistoryItem
         * @static
         * @param {neutron.IImageRepoHistoryItem=} [properties] Properties to set
         * @returns {neutron.ImageRepoHistoryItem} ImageRepoHistoryItem instance
         */
        ImageRepoHistoryItem.create = function create(properties) {
            return new ImageRepoHistoryItem(properties);
        };

        /**
         * Encodes the specified ImageRepoHistoryItem message. Does not implicitly {@link neutron.ImageRepoHistoryItem.verify|verify} messages.
         * @function encode
         * @memberof neutron.ImageRepoHistoryItem
         * @static
         * @param {neutron.IImageRepoHistoryItem} message ImageRepoHistoryItem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ImageRepoHistoryItem.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.id);
            if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.path);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.type);
            if (message.etime != null && Object.hasOwnProperty.call(message, "etime"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.etime);
            if (message.mtime != null && Object.hasOwnProperty.call(message, "mtime"))
                writer.uint32(/* id 5, wireType 0 =*/40).int64(message.mtime);
            if (message.exifData != null && Object.hasOwnProperty.call(message, "exifData"))
                for (let keys = Object.keys(message.exifData), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 7, wireType 2 =*/58).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.google.protobuf.Value.encode(message.exifData[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            return writer;
        };

        /**
         * Encodes the specified ImageRepoHistoryItem message, length delimited. Does not implicitly {@link neutron.ImageRepoHistoryItem.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.ImageRepoHistoryItem
         * @static
         * @param {neutron.IImageRepoHistoryItem} message ImageRepoHistoryItem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ImageRepoHistoryItem.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ImageRepoHistoryItem message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.ImageRepoHistoryItem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.ImageRepoHistoryItem} ImageRepoHistoryItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ImageRepoHistoryItem.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.ImageRepoHistoryItem(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.int64();
                        break;
                    }
                case 2: {
                        message.path = reader.string();
                        break;
                    }
                case 3: {
                        message.type = reader.int32();
                        break;
                    }
                case 4: {
                        message.etime = reader.int64();
                        break;
                    }
                case 5: {
                        message.mtime = reader.int64();
                        break;
                    }
                case 7: {
                        if (message.exifData === $util.emptyObject)
                            message.exifData = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.google.protobuf.Value.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.exifData[key] = value;
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ImageRepoHistoryItem message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.ImageRepoHistoryItem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.ImageRepoHistoryItem} ImageRepoHistoryItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ImageRepoHistoryItem.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ImageRepoHistoryItem message.
         * @function verify
         * @memberof neutron.ImageRepoHistoryItem
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ImageRepoHistoryItem.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.path != null && message.hasOwnProperty("path"))
                if (!$util.isString(message.path))
                    return "path: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isInteger(message.type))
                    return "type: integer expected";
            if (message.etime != null && message.hasOwnProperty("etime"))
                if (!$util.isInteger(message.etime) && !(message.etime && $util.isInteger(message.etime.low) && $util.isInteger(message.etime.high)))
                    return "etime: integer|Long expected";
            if (message.mtime != null && message.hasOwnProperty("mtime"))
                if (!$util.isInteger(message.mtime) && !(message.mtime && $util.isInteger(message.mtime.low) && $util.isInteger(message.mtime.high)))
                    return "mtime: integer|Long expected";
            if (message.exifData != null && message.hasOwnProperty("exifData")) {
                if (!$util.isObject(message.exifData))
                    return "exifData: object expected";
                let key = Object.keys(message.exifData);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.google.protobuf.Value.verify(message.exifData[key[i]]);
                    if (error)
                        return "exifData." + error;
                }
            }
            return null;
        };

        /**
         * Creates an ImageRepoHistoryItem message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.ImageRepoHistoryItem
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.ImageRepoHistoryItem} ImageRepoHistoryItem
         */
        ImageRepoHistoryItem.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.ImageRepoHistoryItem)
                return object;
            let message = new $root.neutron.ImageRepoHistoryItem();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
            if (object.path != null)
                message.path = String(object.path);
            if (object.type != null)
                message.type = object.type | 0;
            if (object.etime != null)
                if ($util.Long)
                    (message.etime = $util.Long.fromValue(object.etime)).unsigned = false;
                else if (typeof object.etime === "string")
                    message.etime = parseInt(object.etime, 10);
                else if (typeof object.etime === "number")
                    message.etime = object.etime;
                else if (typeof object.etime === "object")
                    message.etime = new $util.LongBits(object.etime.low >>> 0, object.etime.high >>> 0).toNumber();
            if (object.mtime != null)
                if ($util.Long)
                    (message.mtime = $util.Long.fromValue(object.mtime)).unsigned = false;
                else if (typeof object.mtime === "string")
                    message.mtime = parseInt(object.mtime, 10);
                else if (typeof object.mtime === "number")
                    message.mtime = object.mtime;
                else if (typeof object.mtime === "object")
                    message.mtime = new $util.LongBits(object.mtime.low >>> 0, object.mtime.high >>> 0).toNumber();
            if (object.exifData) {
                if (typeof object.exifData !== "object")
                    throw TypeError(".neutron.ImageRepoHistoryItem.exifData: object expected");
                message.exifData = {};
                for (let keys = Object.keys(object.exifData), i = 0; i < keys.length; ++i) {
                    if (typeof object.exifData[keys[i]] !== "object")
                        throw TypeError(".neutron.ImageRepoHistoryItem.exifData: object expected");
                    message.exifData[keys[i]] = $root.google.protobuf.Value.fromObject(object.exifData[keys[i]]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an ImageRepoHistoryItem message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.ImageRepoHistoryItem
         * @static
         * @param {neutron.ImageRepoHistoryItem} message ImageRepoHistoryItem
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ImageRepoHistoryItem.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.exifData = {};
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                object.path = "";
                object.type = 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.etime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.etime = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.mtime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.mtime = options.longs === String ? "0" : 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
            if (message.path != null && message.hasOwnProperty("path"))
                object.path = message.path;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.etime != null && message.hasOwnProperty("etime"))
                if (typeof message.etime === "number")
                    object.etime = options.longs === String ? String(message.etime) : message.etime;
                else
                    object.etime = options.longs === String ? $util.Long.prototype.toString.call(message.etime) : options.longs === Number ? new $util.LongBits(message.etime.low >>> 0, message.etime.high >>> 0).toNumber() : message.etime;
            if (message.mtime != null && message.hasOwnProperty("mtime"))
                if (typeof message.mtime === "number")
                    object.mtime = options.longs === String ? String(message.mtime) : message.mtime;
                else
                    object.mtime = options.longs === String ? $util.Long.prototype.toString.call(message.mtime) : options.longs === Number ? new $util.LongBits(message.mtime.low >>> 0, message.mtime.high >>> 0).toNumber() : message.mtime;
            let keys2;
            if (message.exifData && (keys2 = Object.keys(message.exifData)).length) {
                object.exifData = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.exifData[keys2[j]] = $root.google.protobuf.Value.toObject(message.exifData[keys2[j]], options);
            }
            return object;
        };

        /**
         * Converts this ImageRepoHistoryItem to JSON.
         * @function toJSON
         * @memberof neutron.ImageRepoHistoryItem
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ImageRepoHistoryItem.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ImageRepoHistoryItem
         * @function getTypeUrl
         * @memberof neutron.ImageRepoHistoryItem
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ImageRepoHistoryItem.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.ImageRepoHistoryItem";
        };

        return ImageRepoHistoryItem;
    })();

    neutron.ImageRepoHistoryResponse = (function() {

        /**
         * Properties of an ImageRepoHistoryResponse.
         * @memberof neutron
         * @interface IImageRepoHistoryResponse
         * @property {number|null} [total] ImageRepoHistoryResponse total
         * @property {number|Long|null} [maxId] ImageRepoHistoryResponse maxId
         * @property {string|null} [version] ImageRepoHistoryResponse version
         * @property {Array.<neutron.IImageRepoHistoryItem>|null} [items] ImageRepoHistoryResponse items
         */

        /**
         * Constructs a new ImageRepoHistoryResponse.
         * @memberof neutron
         * @classdesc Represents an ImageRepoHistoryResponse.
         * @implements IImageRepoHistoryResponse
         * @constructor
         * @param {neutron.IImageRepoHistoryResponse=} [properties] Properties to set
         */
        function ImageRepoHistoryResponse(properties) {
            this.items = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ImageRepoHistoryResponse total.
         * @member {number} total
         * @memberof neutron.ImageRepoHistoryResponse
         * @instance
         */
        ImageRepoHistoryResponse.prototype.total = 0;

        /**
         * ImageRepoHistoryResponse maxId.
         * @member {number|Long} maxId
         * @memberof neutron.ImageRepoHistoryResponse
         * @instance
         */
        ImageRepoHistoryResponse.prototype.maxId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * ImageRepoHistoryResponse version.
         * @member {string} version
         * @memberof neutron.ImageRepoHistoryResponse
         * @instance
         */
        ImageRepoHistoryResponse.prototype.version = "";

        /**
         * ImageRepoHistoryResponse items.
         * @member {Array.<neutron.IImageRepoHistoryItem>} items
         * @memberof neutron.ImageRepoHistoryResponse
         * @instance
         */
        ImageRepoHistoryResponse.prototype.items = $util.emptyArray;

        /**
         * Creates a new ImageRepoHistoryResponse instance using the specified properties.
         * @function create
         * @memberof neutron.ImageRepoHistoryResponse
         * @static
         * @param {neutron.IImageRepoHistoryResponse=} [properties] Properties to set
         * @returns {neutron.ImageRepoHistoryResponse} ImageRepoHistoryResponse instance
         */
        ImageRepoHistoryResponse.create = function create(properties) {
            return new ImageRepoHistoryResponse(properties);
        };

        /**
         * Encodes the specified ImageRepoHistoryResponse message. Does not implicitly {@link neutron.ImageRepoHistoryResponse.verify|verify} messages.
         * @function encode
         * @memberof neutron.ImageRepoHistoryResponse
         * @static
         * @param {neutron.IImageRepoHistoryResponse} message ImageRepoHistoryResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ImageRepoHistoryResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.total != null && Object.hasOwnProperty.call(message, "total"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.total);
            if (message.maxId != null && Object.hasOwnProperty.call(message, "maxId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.maxId);
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.version);
            if (message.items != null && message.items.length)
                for (let i = 0; i < message.items.length; ++i)
                    $root.neutron.ImageRepoHistoryItem.encode(message.items[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ImageRepoHistoryResponse message, length delimited. Does not implicitly {@link neutron.ImageRepoHistoryResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.ImageRepoHistoryResponse
         * @static
         * @param {neutron.IImageRepoHistoryResponse} message ImageRepoHistoryResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ImageRepoHistoryResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ImageRepoHistoryResponse message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.ImageRepoHistoryResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.ImageRepoHistoryResponse} ImageRepoHistoryResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ImageRepoHistoryResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.ImageRepoHistoryResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.total = reader.int32();
                        break;
                    }
                case 2: {
                        message.maxId = reader.int64();
                        break;
                    }
                case 3: {
                        message.version = reader.string();
                        break;
                    }
                case 4: {
                        if (!(message.items && message.items.length))
                            message.items = [];
                        message.items.push($root.neutron.ImageRepoHistoryItem.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ImageRepoHistoryResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.ImageRepoHistoryResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.ImageRepoHistoryResponse} ImageRepoHistoryResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ImageRepoHistoryResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ImageRepoHistoryResponse message.
         * @function verify
         * @memberof neutron.ImageRepoHistoryResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ImageRepoHistoryResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.total != null && message.hasOwnProperty("total"))
                if (!$util.isInteger(message.total))
                    return "total: integer expected";
            if (message.maxId != null && message.hasOwnProperty("maxId"))
                if (!$util.isInteger(message.maxId) && !(message.maxId && $util.isInteger(message.maxId.low) && $util.isInteger(message.maxId.high)))
                    return "maxId: integer|Long expected";
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isString(message.version))
                    return "version: string expected";
            if (message.items != null && message.hasOwnProperty("items")) {
                if (!Array.isArray(message.items))
                    return "items: array expected";
                for (let i = 0; i < message.items.length; ++i) {
                    let error = $root.neutron.ImageRepoHistoryItem.verify(message.items[i]);
                    if (error)
                        return "items." + error;
                }
            }
            return null;
        };

        /**
         * Creates an ImageRepoHistoryResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.ImageRepoHistoryResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.ImageRepoHistoryResponse} ImageRepoHistoryResponse
         */
        ImageRepoHistoryResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.ImageRepoHistoryResponse)
                return object;
            let message = new $root.neutron.ImageRepoHistoryResponse();
            if (object.total != null)
                message.total = object.total | 0;
            if (object.maxId != null)
                if ($util.Long)
                    (message.maxId = $util.Long.fromValue(object.maxId)).unsigned = false;
                else if (typeof object.maxId === "string")
                    message.maxId = parseInt(object.maxId, 10);
                else if (typeof object.maxId === "number")
                    message.maxId = object.maxId;
                else if (typeof object.maxId === "object")
                    message.maxId = new $util.LongBits(object.maxId.low >>> 0, object.maxId.high >>> 0).toNumber();
            if (object.version != null)
                message.version = String(object.version);
            if (object.items) {
                if (!Array.isArray(object.items))
                    throw TypeError(".neutron.ImageRepoHistoryResponse.items: array expected");
                message.items = [];
                for (let i = 0; i < object.items.length; ++i) {
                    if (typeof object.items[i] !== "object")
                        throw TypeError(".neutron.ImageRepoHistoryResponse.items: object expected");
                    message.items[i] = $root.neutron.ImageRepoHistoryItem.fromObject(object.items[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an ImageRepoHistoryResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.ImageRepoHistoryResponse
         * @static
         * @param {neutron.ImageRepoHistoryResponse} message ImageRepoHistoryResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ImageRepoHistoryResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.items = [];
            if (options.defaults) {
                object.total = 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.maxId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.maxId = options.longs === String ? "0" : 0;
                object.version = "";
            }
            if (message.total != null && message.hasOwnProperty("total"))
                object.total = message.total;
            if (message.maxId != null && message.hasOwnProperty("maxId"))
                if (typeof message.maxId === "number")
                    object.maxId = options.longs === String ? String(message.maxId) : message.maxId;
                else
                    object.maxId = options.longs === String ? $util.Long.prototype.toString.call(message.maxId) : options.longs === Number ? new $util.LongBits(message.maxId.low >>> 0, message.maxId.high >>> 0).toNumber() : message.maxId;
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            if (message.items && message.items.length) {
                object.items = [];
                for (let j = 0; j < message.items.length; ++j)
                    object.items[j] = $root.neutron.ImageRepoHistoryItem.toObject(message.items[j], options);
            }
            return object;
        };

        /**
         * Converts this ImageRepoHistoryResponse to JSON.
         * @function toJSON
         * @memberof neutron.ImageRepoHistoryResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ImageRepoHistoryResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ImageRepoHistoryResponse
         * @function getTypeUrl
         * @memberof neutron.ImageRepoHistoryResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ImageRepoHistoryResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.ImageRepoHistoryResponse";
        };

        return ImageRepoHistoryResponse;
    })();

    neutron.ImageRepoPageRequest = (function() {

        /**
         * Properties of an ImageRepoPageRequest.
         * @memberof neutron
         * @interface IImageRepoPageRequest
         * @property {Array.<string>|null} [types] ImageRepoPageRequest types
         * @property {number|null} [offset] ImageRepoPageRequest offset
         * @property {number|null} [count] ImageRepoPageRequest count
         * @property {string|null} [order] ImageRepoPageRequest order
         */

        /**
         * Constructs a new ImageRepoPageRequest.
         * @memberof neutron
         * @classdesc Represents an ImageRepoPageRequest.
         * @implements IImageRepoPageRequest
         * @constructor
         * @param {neutron.IImageRepoPageRequest=} [properties] Properties to set
         */
        function ImageRepoPageRequest(properties) {
            this.types = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ImageRepoPageRequest types.
         * @member {Array.<string>} types
         * @memberof neutron.ImageRepoPageRequest
         * @instance
         */
        ImageRepoPageRequest.prototype.types = $util.emptyArray;

        /**
         * ImageRepoPageRequest offset.
         * @member {number} offset
         * @memberof neutron.ImageRepoPageRequest
         * @instance
         */
        ImageRepoPageRequest.prototype.offset = 0;

        /**
         * ImageRepoPageRequest count.
         * @member {number} count
         * @memberof neutron.ImageRepoPageRequest
         * @instance
         */
        ImageRepoPageRequest.prototype.count = 0;

        /**
         * ImageRepoPageRequest order.
         * @member {string} order
         * @memberof neutron.ImageRepoPageRequest
         * @instance
         */
        ImageRepoPageRequest.prototype.order = "";

        /**
         * Creates a new ImageRepoPageRequest instance using the specified properties.
         * @function create
         * @memberof neutron.ImageRepoPageRequest
         * @static
         * @param {neutron.IImageRepoPageRequest=} [properties] Properties to set
         * @returns {neutron.ImageRepoPageRequest} ImageRepoPageRequest instance
         */
        ImageRepoPageRequest.create = function create(properties) {
            return new ImageRepoPageRequest(properties);
        };

        /**
         * Encodes the specified ImageRepoPageRequest message. Does not implicitly {@link neutron.ImageRepoPageRequest.verify|verify} messages.
         * @function encode
         * @memberof neutron.ImageRepoPageRequest
         * @static
         * @param {neutron.IImageRepoPageRequest} message ImageRepoPageRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ImageRepoPageRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.types != null && message.types.length)
                for (let i = 0; i < message.types.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.types[i]);
            if (message.offset != null && Object.hasOwnProperty.call(message, "offset"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.offset);
            if (message.count != null && Object.hasOwnProperty.call(message, "count"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.count);
            if (message.order != null && Object.hasOwnProperty.call(message, "order"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.order);
            return writer;
        };

        /**
         * Encodes the specified ImageRepoPageRequest message, length delimited. Does not implicitly {@link neutron.ImageRepoPageRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.ImageRepoPageRequest
         * @static
         * @param {neutron.IImageRepoPageRequest} message ImageRepoPageRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ImageRepoPageRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ImageRepoPageRequest message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.ImageRepoPageRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.ImageRepoPageRequest} ImageRepoPageRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ImageRepoPageRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.ImageRepoPageRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.types && message.types.length))
                            message.types = [];
                        message.types.push(reader.string());
                        break;
                    }
                case 2: {
                        message.offset = reader.int32();
                        break;
                    }
                case 3: {
                        message.count = reader.int32();
                        break;
                    }
                case 4: {
                        message.order = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ImageRepoPageRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.ImageRepoPageRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.ImageRepoPageRequest} ImageRepoPageRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ImageRepoPageRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ImageRepoPageRequest message.
         * @function verify
         * @memberof neutron.ImageRepoPageRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ImageRepoPageRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.types != null && message.hasOwnProperty("types")) {
                if (!Array.isArray(message.types))
                    return "types: array expected";
                for (let i = 0; i < message.types.length; ++i)
                    if (!$util.isString(message.types[i]))
                        return "types: string[] expected";
            }
            if (message.offset != null && message.hasOwnProperty("offset"))
                if (!$util.isInteger(message.offset))
                    return "offset: integer expected";
            if (message.count != null && message.hasOwnProperty("count"))
                if (!$util.isInteger(message.count))
                    return "count: integer expected";
            if (message.order != null && message.hasOwnProperty("order"))
                if (!$util.isString(message.order))
                    return "order: string expected";
            return null;
        };

        /**
         * Creates an ImageRepoPageRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.ImageRepoPageRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.ImageRepoPageRequest} ImageRepoPageRequest
         */
        ImageRepoPageRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.ImageRepoPageRequest)
                return object;
            let message = new $root.neutron.ImageRepoPageRequest();
            if (object.types) {
                if (!Array.isArray(object.types))
                    throw TypeError(".neutron.ImageRepoPageRequest.types: array expected");
                message.types = [];
                for (let i = 0; i < object.types.length; ++i)
                    message.types[i] = String(object.types[i]);
            }
            if (object.offset != null)
                message.offset = object.offset | 0;
            if (object.count != null)
                message.count = object.count | 0;
            if (object.order != null)
                message.order = String(object.order);
            return message;
        };

        /**
         * Creates a plain object from an ImageRepoPageRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.ImageRepoPageRequest
         * @static
         * @param {neutron.ImageRepoPageRequest} message ImageRepoPageRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ImageRepoPageRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.types = [];
            if (options.defaults) {
                object.offset = 0;
                object.count = 0;
                object.order = "";
            }
            if (message.types && message.types.length) {
                object.types = [];
                for (let j = 0; j < message.types.length; ++j)
                    object.types[j] = message.types[j];
            }
            if (message.offset != null && message.hasOwnProperty("offset"))
                object.offset = message.offset;
            if (message.count != null && message.hasOwnProperty("count"))
                object.count = message.count;
            if (message.order != null && message.hasOwnProperty("order"))
                object.order = message.order;
            return object;
        };

        /**
         * Converts this ImageRepoPageRequest to JSON.
         * @function toJSON
         * @memberof neutron.ImageRepoPageRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ImageRepoPageRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ImageRepoPageRequest
         * @function getTypeUrl
         * @memberof neutron.ImageRepoPageRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ImageRepoPageRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.ImageRepoPageRequest";
        };

        return ImageRepoPageRequest;
    })();

    neutron.ImageRepoPageResponse = (function() {

        /**
         * Properties of an ImageRepoPageResponse.
         * @memberof neutron
         * @interface IImageRepoPageResponse
         * @property {number|null} [total] ImageRepoPageResponse total
         * @property {Array.<neutron.IImageRepoHistoryItem>|null} [items] ImageRepoPageResponse items
         */

        /**
         * Constructs a new ImageRepoPageResponse.
         * @memberof neutron
         * @classdesc Represents an ImageRepoPageResponse.
         * @implements IImageRepoPageResponse
         * @constructor
         * @param {neutron.IImageRepoPageResponse=} [properties] Properties to set
         */
        function ImageRepoPageResponse(properties) {
            this.items = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ImageRepoPageResponse total.
         * @member {number} total
         * @memberof neutron.ImageRepoPageResponse
         * @instance
         */
        ImageRepoPageResponse.prototype.total = 0;

        /**
         * ImageRepoPageResponse items.
         * @member {Array.<neutron.IImageRepoHistoryItem>} items
         * @memberof neutron.ImageRepoPageResponse
         * @instance
         */
        ImageRepoPageResponse.prototype.items = $util.emptyArray;

        /**
         * Creates a new ImageRepoPageResponse instance using the specified properties.
         * @function create
         * @memberof neutron.ImageRepoPageResponse
         * @static
         * @param {neutron.IImageRepoPageResponse=} [properties] Properties to set
         * @returns {neutron.ImageRepoPageResponse} ImageRepoPageResponse instance
         */
        ImageRepoPageResponse.create = function create(properties) {
            return new ImageRepoPageResponse(properties);
        };

        /**
         * Encodes the specified ImageRepoPageResponse message. Does not implicitly {@link neutron.ImageRepoPageResponse.verify|verify} messages.
         * @function encode
         * @memberof neutron.ImageRepoPageResponse
         * @static
         * @param {neutron.IImageRepoPageResponse} message ImageRepoPageResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ImageRepoPageResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.total != null && Object.hasOwnProperty.call(message, "total"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.total);
            if (message.items != null && message.items.length)
                for (let i = 0; i < message.items.length; ++i)
                    $root.neutron.ImageRepoHistoryItem.encode(message.items[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ImageRepoPageResponse message, length delimited. Does not implicitly {@link neutron.ImageRepoPageResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.ImageRepoPageResponse
         * @static
         * @param {neutron.IImageRepoPageResponse} message ImageRepoPageResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ImageRepoPageResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ImageRepoPageResponse message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.ImageRepoPageResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.ImageRepoPageResponse} ImageRepoPageResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ImageRepoPageResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.ImageRepoPageResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.total = reader.int32();
                        break;
                    }
                case 2: {
                        if (!(message.items && message.items.length))
                            message.items = [];
                        message.items.push($root.neutron.ImageRepoHistoryItem.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ImageRepoPageResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.ImageRepoPageResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.ImageRepoPageResponse} ImageRepoPageResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ImageRepoPageResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ImageRepoPageResponse message.
         * @function verify
         * @memberof neutron.ImageRepoPageResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ImageRepoPageResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.total != null && message.hasOwnProperty("total"))
                if (!$util.isInteger(message.total))
                    return "total: integer expected";
            if (message.items != null && message.hasOwnProperty("items")) {
                if (!Array.isArray(message.items))
                    return "items: array expected";
                for (let i = 0; i < message.items.length; ++i) {
                    let error = $root.neutron.ImageRepoHistoryItem.verify(message.items[i]);
                    if (error)
                        return "items." + error;
                }
            }
            return null;
        };

        /**
         * Creates an ImageRepoPageResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.ImageRepoPageResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.ImageRepoPageResponse} ImageRepoPageResponse
         */
        ImageRepoPageResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.ImageRepoPageResponse)
                return object;
            let message = new $root.neutron.ImageRepoPageResponse();
            if (object.total != null)
                message.total = object.total | 0;
            if (object.items) {
                if (!Array.isArray(object.items))
                    throw TypeError(".neutron.ImageRepoPageResponse.items: array expected");
                message.items = [];
                for (let i = 0; i < object.items.length; ++i) {
                    if (typeof object.items[i] !== "object")
                        throw TypeError(".neutron.ImageRepoPageResponse.items: object expected");
                    message.items[i] = $root.neutron.ImageRepoHistoryItem.fromObject(object.items[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an ImageRepoPageResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.ImageRepoPageResponse
         * @static
         * @param {neutron.ImageRepoPageResponse} message ImageRepoPageResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ImageRepoPageResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.items = [];
            if (options.defaults)
                object.total = 0;
            if (message.total != null && message.hasOwnProperty("total"))
                object.total = message.total;
            if (message.items && message.items.length) {
                object.items = [];
                for (let j = 0; j < message.items.length; ++j)
                    object.items[j] = $root.neutron.ImageRepoHistoryItem.toObject(message.items[j], options);
            }
            return object;
        };

        /**
         * Converts this ImageRepoPageResponse to JSON.
         * @function toJSON
         * @memberof neutron.ImageRepoPageResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ImageRepoPageResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ImageRepoPageResponse
         * @function getTypeUrl
         * @memberof neutron.ImageRepoPageResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ImageRepoPageResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.ImageRepoPageResponse";
        };

        return ImageRepoPageResponse;
    })();

    neutron.PrepareFileReceiveRequest = (function() {

        /**
         * Properties of a PrepareFileReceiveRequest.
         * @memberof neutron
         * @interface IPrepareFileReceiveRequest
         * @property {string|null} [path] PrepareFileReceiveRequest path
         * @property {string|null} [label] PrepareFileReceiveRequest label
         * @property {number|Long|null} [offset] PrepareFileReceiveRequest offset
         * @property {number|Long|null} [size] PrepareFileReceiveRequest size
         */

        /**
         * Constructs a new PrepareFileReceiveRequest.
         * @memberof neutron
         * @classdesc Represents a PrepareFileReceiveRequest.
         * @implements IPrepareFileReceiveRequest
         * @constructor
         * @param {neutron.IPrepareFileReceiveRequest=} [properties] Properties to set
         */
        function PrepareFileReceiveRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PrepareFileReceiveRequest path.
         * @member {string} path
         * @memberof neutron.PrepareFileReceiveRequest
         * @instance
         */
        PrepareFileReceiveRequest.prototype.path = "";

        /**
         * PrepareFileReceiveRequest label.
         * @member {string} label
         * @memberof neutron.PrepareFileReceiveRequest
         * @instance
         */
        PrepareFileReceiveRequest.prototype.label = "";

        /**
         * PrepareFileReceiveRequest offset.
         * @member {number|Long} offset
         * @memberof neutron.PrepareFileReceiveRequest
         * @instance
         */
        PrepareFileReceiveRequest.prototype.offset = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * PrepareFileReceiveRequest size.
         * @member {number|Long} size
         * @memberof neutron.PrepareFileReceiveRequest
         * @instance
         */
        PrepareFileReceiveRequest.prototype.size = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new PrepareFileReceiveRequest instance using the specified properties.
         * @function create
         * @memberof neutron.PrepareFileReceiveRequest
         * @static
         * @param {neutron.IPrepareFileReceiveRequest=} [properties] Properties to set
         * @returns {neutron.PrepareFileReceiveRequest} PrepareFileReceiveRequest instance
         */
        PrepareFileReceiveRequest.create = function create(properties) {
            return new PrepareFileReceiveRequest(properties);
        };

        /**
         * Encodes the specified PrepareFileReceiveRequest message. Does not implicitly {@link neutron.PrepareFileReceiveRequest.verify|verify} messages.
         * @function encode
         * @memberof neutron.PrepareFileReceiveRequest
         * @static
         * @param {neutron.IPrepareFileReceiveRequest} message PrepareFileReceiveRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PrepareFileReceiveRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
            if (message.label != null && Object.hasOwnProperty.call(message, "label"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.label);
            if (message.offset != null && Object.hasOwnProperty.call(message, "offset"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.offset);
            if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.size);
            return writer;
        };

        /**
         * Encodes the specified PrepareFileReceiveRequest message, length delimited. Does not implicitly {@link neutron.PrepareFileReceiveRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.PrepareFileReceiveRequest
         * @static
         * @param {neutron.IPrepareFileReceiveRequest} message PrepareFileReceiveRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PrepareFileReceiveRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PrepareFileReceiveRequest message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.PrepareFileReceiveRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.PrepareFileReceiveRequest} PrepareFileReceiveRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PrepareFileReceiveRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.PrepareFileReceiveRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.path = reader.string();
                        break;
                    }
                case 2: {
                        message.label = reader.string();
                        break;
                    }
                case 3: {
                        message.offset = reader.int64();
                        break;
                    }
                case 4: {
                        message.size = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PrepareFileReceiveRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.PrepareFileReceiveRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.PrepareFileReceiveRequest} PrepareFileReceiveRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PrepareFileReceiveRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PrepareFileReceiveRequest message.
         * @function verify
         * @memberof neutron.PrepareFileReceiveRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PrepareFileReceiveRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.path != null && message.hasOwnProperty("path"))
                if (!$util.isString(message.path))
                    return "path: string expected";
            if (message.label != null && message.hasOwnProperty("label"))
                if (!$util.isString(message.label))
                    return "label: string expected";
            if (message.offset != null && message.hasOwnProperty("offset"))
                if (!$util.isInteger(message.offset) && !(message.offset && $util.isInteger(message.offset.low) && $util.isInteger(message.offset.high)))
                    return "offset: integer|Long expected";
            if (message.size != null && message.hasOwnProperty("size"))
                if (!$util.isInteger(message.size) && !(message.size && $util.isInteger(message.size.low) && $util.isInteger(message.size.high)))
                    return "size: integer|Long expected";
            return null;
        };

        /**
         * Creates a PrepareFileReceiveRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.PrepareFileReceiveRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.PrepareFileReceiveRequest} PrepareFileReceiveRequest
         */
        PrepareFileReceiveRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.PrepareFileReceiveRequest)
                return object;
            let message = new $root.neutron.PrepareFileReceiveRequest();
            if (object.path != null)
                message.path = String(object.path);
            if (object.label != null)
                message.label = String(object.label);
            if (object.offset != null)
                if ($util.Long)
                    (message.offset = $util.Long.fromValue(object.offset)).unsigned = false;
                else if (typeof object.offset === "string")
                    message.offset = parseInt(object.offset, 10);
                else if (typeof object.offset === "number")
                    message.offset = object.offset;
                else if (typeof object.offset === "object")
                    message.offset = new $util.LongBits(object.offset.low >>> 0, object.offset.high >>> 0).toNumber();
            if (object.size != null)
                if ($util.Long)
                    (message.size = $util.Long.fromValue(object.size)).unsigned = false;
                else if (typeof object.size === "string")
                    message.size = parseInt(object.size, 10);
                else if (typeof object.size === "number")
                    message.size = object.size;
                else if (typeof object.size === "object")
                    message.size = new $util.LongBits(object.size.low >>> 0, object.size.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a PrepareFileReceiveRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.PrepareFileReceiveRequest
         * @static
         * @param {neutron.PrepareFileReceiveRequest} message PrepareFileReceiveRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PrepareFileReceiveRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.path = "";
                object.label = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.offset = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.offset = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.size = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.size = options.longs === String ? "0" : 0;
            }
            if (message.path != null && message.hasOwnProperty("path"))
                object.path = message.path;
            if (message.label != null && message.hasOwnProperty("label"))
                object.label = message.label;
            if (message.offset != null && message.hasOwnProperty("offset"))
                if (typeof message.offset === "number")
                    object.offset = options.longs === String ? String(message.offset) : message.offset;
                else
                    object.offset = options.longs === String ? $util.Long.prototype.toString.call(message.offset) : options.longs === Number ? new $util.LongBits(message.offset.low >>> 0, message.offset.high >>> 0).toNumber() : message.offset;
            if (message.size != null && message.hasOwnProperty("size"))
                if (typeof message.size === "number")
                    object.size = options.longs === String ? String(message.size) : message.size;
                else
                    object.size = options.longs === String ? $util.Long.prototype.toString.call(message.size) : options.longs === Number ? new $util.LongBits(message.size.low >>> 0, message.size.high >>> 0).toNumber() : message.size;
            return object;
        };

        /**
         * Converts this PrepareFileReceiveRequest to JSON.
         * @function toJSON
         * @memberof neutron.PrepareFileReceiveRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PrepareFileReceiveRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PrepareFileReceiveRequest
         * @function getTypeUrl
         * @memberof neutron.PrepareFileReceiveRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PrepareFileReceiveRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.PrepareFileReceiveRequest";
        };

        return PrepareFileReceiveRequest;
    })();

    neutron.PrepareFileReceiveResponse = (function() {

        /**
         * Properties of a PrepareFileReceiveResponse.
         * @memberof neutron
         * @interface IPrepareFileReceiveResponse
         * @property {number|Long|null} [size] PrepareFileReceiveResponse size
         */

        /**
         * Constructs a new PrepareFileReceiveResponse.
         * @memberof neutron
         * @classdesc Represents a PrepareFileReceiveResponse.
         * @implements IPrepareFileReceiveResponse
         * @constructor
         * @param {neutron.IPrepareFileReceiveResponse=} [properties] Properties to set
         */
        function PrepareFileReceiveResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PrepareFileReceiveResponse size.
         * @member {number|Long} size
         * @memberof neutron.PrepareFileReceiveResponse
         * @instance
         */
        PrepareFileReceiveResponse.prototype.size = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new PrepareFileReceiveResponse instance using the specified properties.
         * @function create
         * @memberof neutron.PrepareFileReceiveResponse
         * @static
         * @param {neutron.IPrepareFileReceiveResponse=} [properties] Properties to set
         * @returns {neutron.PrepareFileReceiveResponse} PrepareFileReceiveResponse instance
         */
        PrepareFileReceiveResponse.create = function create(properties) {
            return new PrepareFileReceiveResponse(properties);
        };

        /**
         * Encodes the specified PrepareFileReceiveResponse message. Does not implicitly {@link neutron.PrepareFileReceiveResponse.verify|verify} messages.
         * @function encode
         * @memberof neutron.PrepareFileReceiveResponse
         * @static
         * @param {neutron.IPrepareFileReceiveResponse} message PrepareFileReceiveResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PrepareFileReceiveResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.size);
            return writer;
        };

        /**
         * Encodes the specified PrepareFileReceiveResponse message, length delimited. Does not implicitly {@link neutron.PrepareFileReceiveResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.PrepareFileReceiveResponse
         * @static
         * @param {neutron.IPrepareFileReceiveResponse} message PrepareFileReceiveResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PrepareFileReceiveResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PrepareFileReceiveResponse message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.PrepareFileReceiveResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.PrepareFileReceiveResponse} PrepareFileReceiveResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PrepareFileReceiveResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.PrepareFileReceiveResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 2: {
                        message.size = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PrepareFileReceiveResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.PrepareFileReceiveResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.PrepareFileReceiveResponse} PrepareFileReceiveResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PrepareFileReceiveResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PrepareFileReceiveResponse message.
         * @function verify
         * @memberof neutron.PrepareFileReceiveResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PrepareFileReceiveResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.size != null && message.hasOwnProperty("size"))
                if (!$util.isInteger(message.size) && !(message.size && $util.isInteger(message.size.low) && $util.isInteger(message.size.high)))
                    return "size: integer|Long expected";
            return null;
        };

        /**
         * Creates a PrepareFileReceiveResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.PrepareFileReceiveResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.PrepareFileReceiveResponse} PrepareFileReceiveResponse
         */
        PrepareFileReceiveResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.PrepareFileReceiveResponse)
                return object;
            let message = new $root.neutron.PrepareFileReceiveResponse();
            if (object.size != null)
                if ($util.Long)
                    (message.size = $util.Long.fromValue(object.size)).unsigned = false;
                else if (typeof object.size === "string")
                    message.size = parseInt(object.size, 10);
                else if (typeof object.size === "number")
                    message.size = object.size;
                else if (typeof object.size === "object")
                    message.size = new $util.LongBits(object.size.low >>> 0, object.size.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a PrepareFileReceiveResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.PrepareFileReceiveResponse
         * @static
         * @param {neutron.PrepareFileReceiveResponse} message PrepareFileReceiveResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PrepareFileReceiveResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.size = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.size = options.longs === String ? "0" : 0;
            if (message.size != null && message.hasOwnProperty("size"))
                if (typeof message.size === "number")
                    object.size = options.longs === String ? String(message.size) : message.size;
                else
                    object.size = options.longs === String ? $util.Long.prototype.toString.call(message.size) : options.longs === Number ? new $util.LongBits(message.size.low >>> 0, message.size.high >>> 0).toNumber() : message.size;
            return object;
        };

        /**
         * Converts this PrepareFileReceiveResponse to JSON.
         * @function toJSON
         * @memberof neutron.PrepareFileReceiveResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PrepareFileReceiveResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PrepareFileReceiveResponse
         * @function getTypeUrl
         * @memberof neutron.PrepareFileReceiveResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PrepareFileReceiveResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.PrepareFileReceiveResponse";
        };

        return PrepareFileReceiveResponse;
    })();

    neutron.GetFileInfoRequest = (function() {

        /**
         * Properties of a GetFileInfoRequest.
         * @memberof neutron
         * @interface IGetFileInfoRequest
         * @property {string|null} [path] GetFileInfoRequest path
         */

        /**
         * Constructs a new GetFileInfoRequest.
         * @memberof neutron
         * @classdesc Represents a GetFileInfoRequest.
         * @implements IGetFileInfoRequest
         * @constructor
         * @param {neutron.IGetFileInfoRequest=} [properties] Properties to set
         */
        function GetFileInfoRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetFileInfoRequest path.
         * @member {string} path
         * @memberof neutron.GetFileInfoRequest
         * @instance
         */
        GetFileInfoRequest.prototype.path = "";

        /**
         * Creates a new GetFileInfoRequest instance using the specified properties.
         * @function create
         * @memberof neutron.GetFileInfoRequest
         * @static
         * @param {neutron.IGetFileInfoRequest=} [properties] Properties to set
         * @returns {neutron.GetFileInfoRequest} GetFileInfoRequest instance
         */
        GetFileInfoRequest.create = function create(properties) {
            return new GetFileInfoRequest(properties);
        };

        /**
         * Encodes the specified GetFileInfoRequest message. Does not implicitly {@link neutron.GetFileInfoRequest.verify|verify} messages.
         * @function encode
         * @memberof neutron.GetFileInfoRequest
         * @static
         * @param {neutron.IGetFileInfoRequest} message GetFileInfoRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFileInfoRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
            return writer;
        };

        /**
         * Encodes the specified GetFileInfoRequest message, length delimited. Does not implicitly {@link neutron.GetFileInfoRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.GetFileInfoRequest
         * @static
         * @param {neutron.IGetFileInfoRequest} message GetFileInfoRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFileInfoRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GetFileInfoRequest message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.GetFileInfoRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.GetFileInfoRequest} GetFileInfoRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFileInfoRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.GetFileInfoRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.path = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GetFileInfoRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.GetFileInfoRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.GetFileInfoRequest} GetFileInfoRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFileInfoRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetFileInfoRequest message.
         * @function verify
         * @memberof neutron.GetFileInfoRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetFileInfoRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.path != null && message.hasOwnProperty("path"))
                if (!$util.isString(message.path))
                    return "path: string expected";
            return null;
        };

        /**
         * Creates a GetFileInfoRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.GetFileInfoRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.GetFileInfoRequest} GetFileInfoRequest
         */
        GetFileInfoRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.GetFileInfoRequest)
                return object;
            let message = new $root.neutron.GetFileInfoRequest();
            if (object.path != null)
                message.path = String(object.path);
            return message;
        };

        /**
         * Creates a plain object from a GetFileInfoRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.GetFileInfoRequest
         * @static
         * @param {neutron.GetFileInfoRequest} message GetFileInfoRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetFileInfoRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.path = "";
            if (message.path != null && message.hasOwnProperty("path"))
                object.path = message.path;
            return object;
        };

        /**
         * Converts this GetFileInfoRequest to JSON.
         * @function toJSON
         * @memberof neutron.GetFileInfoRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetFileInfoRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetFileInfoRequest
         * @function getTypeUrl
         * @memberof neutron.GetFileInfoRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetFileInfoRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.GetFileInfoRequest";
        };

        return GetFileInfoRequest;
    })();

    neutron.ListFilesRequest = (function() {

        /**
         * Properties of a ListFilesRequest.
         * @memberof neutron
         * @interface IListFilesRequest
         * @property {string|null} [path] ListFilesRequest path
         */

        /**
         * Constructs a new ListFilesRequest.
         * @memberof neutron
         * @classdesc Represents a ListFilesRequest.
         * @implements IListFilesRequest
         * @constructor
         * @param {neutron.IListFilesRequest=} [properties] Properties to set
         */
        function ListFilesRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListFilesRequest path.
         * @member {string} path
         * @memberof neutron.ListFilesRequest
         * @instance
         */
        ListFilesRequest.prototype.path = "";

        /**
         * Creates a new ListFilesRequest instance using the specified properties.
         * @function create
         * @memberof neutron.ListFilesRequest
         * @static
         * @param {neutron.IListFilesRequest=} [properties] Properties to set
         * @returns {neutron.ListFilesRequest} ListFilesRequest instance
         */
        ListFilesRequest.create = function create(properties) {
            return new ListFilesRequest(properties);
        };

        /**
         * Encodes the specified ListFilesRequest message. Does not implicitly {@link neutron.ListFilesRequest.verify|verify} messages.
         * @function encode
         * @memberof neutron.ListFilesRequest
         * @static
         * @param {neutron.IListFilesRequest} message ListFilesRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListFilesRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
            return writer;
        };

        /**
         * Encodes the specified ListFilesRequest message, length delimited. Does not implicitly {@link neutron.ListFilesRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.ListFilesRequest
         * @static
         * @param {neutron.IListFilesRequest} message ListFilesRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListFilesRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ListFilesRequest message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.ListFilesRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.ListFilesRequest} ListFilesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListFilesRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.ListFilesRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.path = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ListFilesRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.ListFilesRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.ListFilesRequest} ListFilesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListFilesRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListFilesRequest message.
         * @function verify
         * @memberof neutron.ListFilesRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListFilesRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.path != null && message.hasOwnProperty("path"))
                if (!$util.isString(message.path))
                    return "path: string expected";
            return null;
        };

        /**
         * Creates a ListFilesRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.ListFilesRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.ListFilesRequest} ListFilesRequest
         */
        ListFilesRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.ListFilesRequest)
                return object;
            let message = new $root.neutron.ListFilesRequest();
            if (object.path != null)
                message.path = String(object.path);
            return message;
        };

        /**
         * Creates a plain object from a ListFilesRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.ListFilesRequest
         * @static
         * @param {neutron.ListFilesRequest} message ListFilesRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListFilesRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.path = "";
            if (message.path != null && message.hasOwnProperty("path"))
                object.path = message.path;
            return object;
        };

        /**
         * Converts this ListFilesRequest to JSON.
         * @function toJSON
         * @memberof neutron.ListFilesRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListFilesRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListFilesRequest
         * @function getTypeUrl
         * @memberof neutron.ListFilesRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListFilesRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.ListFilesRequest";
        };

        return ListFilesRequest;
    })();

    neutron.ListFilesResponse = (function() {

        /**
         * Properties of a ListFilesResponse.
         * @memberof neutron
         * @interface IListFilesResponse
         * @property {Array.<neutron.IFileInformation>|null} [files] ListFilesResponse files
         */

        /**
         * Constructs a new ListFilesResponse.
         * @memberof neutron
         * @classdesc Represents a ListFilesResponse.
         * @implements IListFilesResponse
         * @constructor
         * @param {neutron.IListFilesResponse=} [properties] Properties to set
         */
        function ListFilesResponse(properties) {
            this.files = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListFilesResponse files.
         * @member {Array.<neutron.IFileInformation>} files
         * @memberof neutron.ListFilesResponse
         * @instance
         */
        ListFilesResponse.prototype.files = $util.emptyArray;

        /**
         * Creates a new ListFilesResponse instance using the specified properties.
         * @function create
         * @memberof neutron.ListFilesResponse
         * @static
         * @param {neutron.IListFilesResponse=} [properties] Properties to set
         * @returns {neutron.ListFilesResponse} ListFilesResponse instance
         */
        ListFilesResponse.create = function create(properties) {
            return new ListFilesResponse(properties);
        };

        /**
         * Encodes the specified ListFilesResponse message. Does not implicitly {@link neutron.ListFilesResponse.verify|verify} messages.
         * @function encode
         * @memberof neutron.ListFilesResponse
         * @static
         * @param {neutron.IListFilesResponse} message ListFilesResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListFilesResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.files != null && message.files.length)
                for (let i = 0; i < message.files.length; ++i)
                    $root.neutron.FileInformation.encode(message.files[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ListFilesResponse message, length delimited. Does not implicitly {@link neutron.ListFilesResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.ListFilesResponse
         * @static
         * @param {neutron.IListFilesResponse} message ListFilesResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListFilesResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ListFilesResponse message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.ListFilesResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.ListFilesResponse} ListFilesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListFilesResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.ListFilesResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.files && message.files.length))
                            message.files = [];
                        message.files.push($root.neutron.FileInformation.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ListFilesResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.ListFilesResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.ListFilesResponse} ListFilesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListFilesResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListFilesResponse message.
         * @function verify
         * @memberof neutron.ListFilesResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListFilesResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.files != null && message.hasOwnProperty("files")) {
                if (!Array.isArray(message.files))
                    return "files: array expected";
                for (let i = 0; i < message.files.length; ++i) {
                    let error = $root.neutron.FileInformation.verify(message.files[i]);
                    if (error)
                        return "files." + error;
                }
            }
            return null;
        };

        /**
         * Creates a ListFilesResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.ListFilesResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.ListFilesResponse} ListFilesResponse
         */
        ListFilesResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.ListFilesResponse)
                return object;
            let message = new $root.neutron.ListFilesResponse();
            if (object.files) {
                if (!Array.isArray(object.files))
                    throw TypeError(".neutron.ListFilesResponse.files: array expected");
                message.files = [];
                for (let i = 0; i < object.files.length; ++i) {
                    if (typeof object.files[i] !== "object")
                        throw TypeError(".neutron.ListFilesResponse.files: object expected");
                    message.files[i] = $root.neutron.FileInformation.fromObject(object.files[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a ListFilesResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.ListFilesResponse
         * @static
         * @param {neutron.ListFilesResponse} message ListFilesResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListFilesResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.files = [];
            if (message.files && message.files.length) {
                object.files = [];
                for (let j = 0; j < message.files.length; ++j)
                    object.files[j] = $root.neutron.FileInformation.toObject(message.files[j], options);
            }
            return object;
        };

        /**
         * Converts this ListFilesResponse to JSON.
         * @function toJSON
         * @memberof neutron.ListFilesResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListFilesResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListFilesResponse
         * @function getTypeUrl
         * @memberof neutron.ListFilesResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListFilesResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.ListFilesResponse";
        };

        return ListFilesResponse;
    })();

    neutron.GetFileSystemVersionRequest = (function() {

        /**
         * Properties of a GetFileSystemVersionRequest.
         * @memberof neutron
         * @interface IGetFileSystemVersionRequest
         */

        /**
         * Constructs a new GetFileSystemVersionRequest.
         * @memberof neutron
         * @classdesc Represents a GetFileSystemVersionRequest.
         * @implements IGetFileSystemVersionRequest
         * @constructor
         * @param {neutron.IGetFileSystemVersionRequest=} [properties] Properties to set
         */
        function GetFileSystemVersionRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new GetFileSystemVersionRequest instance using the specified properties.
         * @function create
         * @memberof neutron.GetFileSystemVersionRequest
         * @static
         * @param {neutron.IGetFileSystemVersionRequest=} [properties] Properties to set
         * @returns {neutron.GetFileSystemVersionRequest} GetFileSystemVersionRequest instance
         */
        GetFileSystemVersionRequest.create = function create(properties) {
            return new GetFileSystemVersionRequest(properties);
        };

        /**
         * Encodes the specified GetFileSystemVersionRequest message. Does not implicitly {@link neutron.GetFileSystemVersionRequest.verify|verify} messages.
         * @function encode
         * @memberof neutron.GetFileSystemVersionRequest
         * @static
         * @param {neutron.IGetFileSystemVersionRequest} message GetFileSystemVersionRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFileSystemVersionRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Encodes the specified GetFileSystemVersionRequest message, length delimited. Does not implicitly {@link neutron.GetFileSystemVersionRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.GetFileSystemVersionRequest
         * @static
         * @param {neutron.IGetFileSystemVersionRequest} message GetFileSystemVersionRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFileSystemVersionRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GetFileSystemVersionRequest message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.GetFileSystemVersionRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.GetFileSystemVersionRequest} GetFileSystemVersionRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFileSystemVersionRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.GetFileSystemVersionRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GetFileSystemVersionRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.GetFileSystemVersionRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.GetFileSystemVersionRequest} GetFileSystemVersionRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFileSystemVersionRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetFileSystemVersionRequest message.
         * @function verify
         * @memberof neutron.GetFileSystemVersionRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetFileSystemVersionRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        /**
         * Creates a GetFileSystemVersionRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.GetFileSystemVersionRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.GetFileSystemVersionRequest} GetFileSystemVersionRequest
         */
        GetFileSystemVersionRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.GetFileSystemVersionRequest)
                return object;
            return new $root.neutron.GetFileSystemVersionRequest();
        };

        /**
         * Creates a plain object from a GetFileSystemVersionRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.GetFileSystemVersionRequest
         * @static
         * @param {neutron.GetFileSystemVersionRequest} message GetFileSystemVersionRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetFileSystemVersionRequest.toObject = function toObject() {
            return {};
        };

        /**
         * Converts this GetFileSystemVersionRequest to JSON.
         * @function toJSON
         * @memberof neutron.GetFileSystemVersionRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetFileSystemVersionRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetFileSystemVersionRequest
         * @function getTypeUrl
         * @memberof neutron.GetFileSystemVersionRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetFileSystemVersionRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.GetFileSystemVersionRequest";
        };

        return GetFileSystemVersionRequest;
    })();

    neutron.GetFileSystemVersionResponse = (function() {

        /**
         * Properties of a GetFileSystemVersionResponse.
         * @memberof neutron
         * @interface IGetFileSystemVersionResponse
         * @property {string|null} [version] GetFileSystemVersionResponse version
         */

        /**
         * Constructs a new GetFileSystemVersionResponse.
         * @memberof neutron
         * @classdesc Represents a GetFileSystemVersionResponse.
         * @implements IGetFileSystemVersionResponse
         * @constructor
         * @param {neutron.IGetFileSystemVersionResponse=} [properties] Properties to set
         */
        function GetFileSystemVersionResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetFileSystemVersionResponse version.
         * @member {string} version
         * @memberof neutron.GetFileSystemVersionResponse
         * @instance
         */
        GetFileSystemVersionResponse.prototype.version = "";

        /**
         * Creates a new GetFileSystemVersionResponse instance using the specified properties.
         * @function create
         * @memberof neutron.GetFileSystemVersionResponse
         * @static
         * @param {neutron.IGetFileSystemVersionResponse=} [properties] Properties to set
         * @returns {neutron.GetFileSystemVersionResponse} GetFileSystemVersionResponse instance
         */
        GetFileSystemVersionResponse.create = function create(properties) {
            return new GetFileSystemVersionResponse(properties);
        };

        /**
         * Encodes the specified GetFileSystemVersionResponse message. Does not implicitly {@link neutron.GetFileSystemVersionResponse.verify|verify} messages.
         * @function encode
         * @memberof neutron.GetFileSystemVersionResponse
         * @static
         * @param {neutron.IGetFileSystemVersionResponse} message GetFileSystemVersionResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFileSystemVersionResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.version);
            return writer;
        };

        /**
         * Encodes the specified GetFileSystemVersionResponse message, length delimited. Does not implicitly {@link neutron.GetFileSystemVersionResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.GetFileSystemVersionResponse
         * @static
         * @param {neutron.IGetFileSystemVersionResponse} message GetFileSystemVersionResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFileSystemVersionResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GetFileSystemVersionResponse message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.GetFileSystemVersionResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.GetFileSystemVersionResponse} GetFileSystemVersionResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFileSystemVersionResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.GetFileSystemVersionResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.version = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GetFileSystemVersionResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.GetFileSystemVersionResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.GetFileSystemVersionResponse} GetFileSystemVersionResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFileSystemVersionResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetFileSystemVersionResponse message.
         * @function verify
         * @memberof neutron.GetFileSystemVersionResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetFileSystemVersionResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isString(message.version))
                    return "version: string expected";
            return null;
        };

        /**
         * Creates a GetFileSystemVersionResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.GetFileSystemVersionResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.GetFileSystemVersionResponse} GetFileSystemVersionResponse
         */
        GetFileSystemVersionResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.GetFileSystemVersionResponse)
                return object;
            let message = new $root.neutron.GetFileSystemVersionResponse();
            if (object.version != null)
                message.version = String(object.version);
            return message;
        };

        /**
         * Creates a plain object from a GetFileSystemVersionResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.GetFileSystemVersionResponse
         * @static
         * @param {neutron.GetFileSystemVersionResponse} message GetFileSystemVersionResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetFileSystemVersionResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.version = "";
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            return object;
        };

        /**
         * Converts this GetFileSystemVersionResponse to JSON.
         * @function toJSON
         * @memberof neutron.GetFileSystemVersionResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetFileSystemVersionResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetFileSystemVersionResponse
         * @function getTypeUrl
         * @memberof neutron.GetFileSystemVersionResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetFileSystemVersionResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.GetFileSystemVersionResponse";
        };

        return GetFileSystemVersionResponse;
    })();

    neutron.GetThumbnailRequest = (function() {

        /**
         * Properties of a GetThumbnailRequest.
         * @memberof neutron
         * @interface IGetThumbnailRequest
         * @property {string|null} [path] GetThumbnailRequest path
         * @property {number|null} [size] GetThumbnailRequest size
         */

        /**
         * Constructs a new GetThumbnailRequest.
         * @memberof neutron
         * @classdesc Represents a GetThumbnailRequest.
         * @implements IGetThumbnailRequest
         * @constructor
         * @param {neutron.IGetThumbnailRequest=} [properties] Properties to set
         */
        function GetThumbnailRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetThumbnailRequest path.
         * @member {string} path
         * @memberof neutron.GetThumbnailRequest
         * @instance
         */
        GetThumbnailRequest.prototype.path = "";

        /**
         * GetThumbnailRequest size.
         * @member {number} size
         * @memberof neutron.GetThumbnailRequest
         * @instance
         */
        GetThumbnailRequest.prototype.size = 0;

        /**
         * Creates a new GetThumbnailRequest instance using the specified properties.
         * @function create
         * @memberof neutron.GetThumbnailRequest
         * @static
         * @param {neutron.IGetThumbnailRequest=} [properties] Properties to set
         * @returns {neutron.GetThumbnailRequest} GetThumbnailRequest instance
         */
        GetThumbnailRequest.create = function create(properties) {
            return new GetThumbnailRequest(properties);
        };

        /**
         * Encodes the specified GetThumbnailRequest message. Does not implicitly {@link neutron.GetThumbnailRequest.verify|verify} messages.
         * @function encode
         * @memberof neutron.GetThumbnailRequest
         * @static
         * @param {neutron.IGetThumbnailRequest} message GetThumbnailRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetThumbnailRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
            if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.size);
            return writer;
        };

        /**
         * Encodes the specified GetThumbnailRequest message, length delimited. Does not implicitly {@link neutron.GetThumbnailRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.GetThumbnailRequest
         * @static
         * @param {neutron.IGetThumbnailRequest} message GetThumbnailRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetThumbnailRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GetThumbnailRequest message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.GetThumbnailRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.GetThumbnailRequest} GetThumbnailRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetThumbnailRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.GetThumbnailRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.path = reader.string();
                        break;
                    }
                case 2: {
                        message.size = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GetThumbnailRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.GetThumbnailRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.GetThumbnailRequest} GetThumbnailRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetThumbnailRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetThumbnailRequest message.
         * @function verify
         * @memberof neutron.GetThumbnailRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetThumbnailRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.path != null && message.hasOwnProperty("path"))
                if (!$util.isString(message.path))
                    return "path: string expected";
            if (message.size != null && message.hasOwnProperty("size"))
                if (!$util.isInteger(message.size))
                    return "size: integer expected";
            return null;
        };

        /**
         * Creates a GetThumbnailRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.GetThumbnailRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.GetThumbnailRequest} GetThumbnailRequest
         */
        GetThumbnailRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.GetThumbnailRequest)
                return object;
            let message = new $root.neutron.GetThumbnailRequest();
            if (object.path != null)
                message.path = String(object.path);
            if (object.size != null)
                message.size = object.size | 0;
            return message;
        };

        /**
         * Creates a plain object from a GetThumbnailRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.GetThumbnailRequest
         * @static
         * @param {neutron.GetThumbnailRequest} message GetThumbnailRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetThumbnailRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.path = "";
                object.size = 0;
            }
            if (message.path != null && message.hasOwnProperty("path"))
                object.path = message.path;
            if (message.size != null && message.hasOwnProperty("size"))
                object.size = message.size;
            return object;
        };

        /**
         * Converts this GetThumbnailRequest to JSON.
         * @function toJSON
         * @memberof neutron.GetThumbnailRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetThumbnailRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetThumbnailRequest
         * @function getTypeUrl
         * @memberof neutron.GetThumbnailRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetThumbnailRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.GetThumbnailRequest";
        };

        return GetThumbnailRequest;
    })();

    neutron.GetThumbnailResponse = (function() {

        /**
         * Properties of a GetThumbnailResponse.
         * @memberof neutron
         * @interface IGetThumbnailResponse
         * @property {string|null} [id] GetThumbnailResponse id
         * @property {string|null} [dataChannel] GetThumbnailResponse dataChannel
         * @property {number|null} [size] GetThumbnailResponse size
         */

        /**
         * Constructs a new GetThumbnailResponse.
         * @memberof neutron
         * @classdesc Represents a GetThumbnailResponse.
         * @implements IGetThumbnailResponse
         * @constructor
         * @param {neutron.IGetThumbnailResponse=} [properties] Properties to set
         */
        function GetThumbnailResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetThumbnailResponse id.
         * @member {string} id
         * @memberof neutron.GetThumbnailResponse
         * @instance
         */
        GetThumbnailResponse.prototype.id = "";

        /**
         * GetThumbnailResponse dataChannel.
         * @member {string} dataChannel
         * @memberof neutron.GetThumbnailResponse
         * @instance
         */
        GetThumbnailResponse.prototype.dataChannel = "";

        /**
         * GetThumbnailResponse size.
         * @member {number} size
         * @memberof neutron.GetThumbnailResponse
         * @instance
         */
        GetThumbnailResponse.prototype.size = 0;

        /**
         * Creates a new GetThumbnailResponse instance using the specified properties.
         * @function create
         * @memberof neutron.GetThumbnailResponse
         * @static
         * @param {neutron.IGetThumbnailResponse=} [properties] Properties to set
         * @returns {neutron.GetThumbnailResponse} GetThumbnailResponse instance
         */
        GetThumbnailResponse.create = function create(properties) {
            return new GetThumbnailResponse(properties);
        };

        /**
         * Encodes the specified GetThumbnailResponse message. Does not implicitly {@link neutron.GetThumbnailResponse.verify|verify} messages.
         * @function encode
         * @memberof neutron.GetThumbnailResponse
         * @static
         * @param {neutron.IGetThumbnailResponse} message GetThumbnailResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetThumbnailResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.dataChannel != null && Object.hasOwnProperty.call(message, "dataChannel"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.dataChannel);
            if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.size);
            return writer;
        };

        /**
         * Encodes the specified GetThumbnailResponse message, length delimited. Does not implicitly {@link neutron.GetThumbnailResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.GetThumbnailResponse
         * @static
         * @param {neutron.IGetThumbnailResponse} message GetThumbnailResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetThumbnailResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GetThumbnailResponse message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.GetThumbnailResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.GetThumbnailResponse} GetThumbnailResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetThumbnailResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.GetThumbnailResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.dataChannel = reader.string();
                        break;
                    }
                case 3: {
                        message.size = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GetThumbnailResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.GetThumbnailResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.GetThumbnailResponse} GetThumbnailResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetThumbnailResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetThumbnailResponse message.
         * @function verify
         * @memberof neutron.GetThumbnailResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetThumbnailResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.dataChannel != null && message.hasOwnProperty("dataChannel"))
                if (!$util.isString(message.dataChannel))
                    return "dataChannel: string expected";
            if (message.size != null && message.hasOwnProperty("size"))
                if (!$util.isInteger(message.size))
                    return "size: integer expected";
            return null;
        };

        /**
         * Creates a GetThumbnailResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.GetThumbnailResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.GetThumbnailResponse} GetThumbnailResponse
         */
        GetThumbnailResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.GetThumbnailResponse)
                return object;
            let message = new $root.neutron.GetThumbnailResponse();
            if (object.id != null)
                message.id = String(object.id);
            if (object.dataChannel != null)
                message.dataChannel = String(object.dataChannel);
            if (object.size != null)
                message.size = object.size | 0;
            return message;
        };

        /**
         * Creates a plain object from a GetThumbnailResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.GetThumbnailResponse
         * @static
         * @param {neutron.GetThumbnailResponse} message GetThumbnailResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetThumbnailResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.dataChannel = "";
                object.size = 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.dataChannel != null && message.hasOwnProperty("dataChannel"))
                object.dataChannel = message.dataChannel;
            if (message.size != null && message.hasOwnProperty("size"))
                object.size = message.size;
            return object;
        };

        /**
         * Converts this GetThumbnailResponse to JSON.
         * @function toJSON
         * @memberof neutron.GetThumbnailResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetThumbnailResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetThumbnailResponse
         * @function getTypeUrl
         * @memberof neutron.GetThumbnailResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetThumbnailResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.GetThumbnailResponse";
        };

        return GetThumbnailResponse;
    })();

    neutron.PlayVideoRequest = (function() {

        /**
         * Properties of a PlayVideoRequest.
         * @memberof neutron
         * @interface IPlayVideoRequest
         * @property {string|null} [path] PlayVideoRequest path
         */

        /**
         * Constructs a new PlayVideoRequest.
         * @memberof neutron
         * @classdesc Represents a PlayVideoRequest.
         * @implements IPlayVideoRequest
         * @constructor
         * @param {neutron.IPlayVideoRequest=} [properties] Properties to set
         */
        function PlayVideoRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PlayVideoRequest path.
         * @member {string} path
         * @memberof neutron.PlayVideoRequest
         * @instance
         */
        PlayVideoRequest.prototype.path = "";

        /**
         * Creates a new PlayVideoRequest instance using the specified properties.
         * @function create
         * @memberof neutron.PlayVideoRequest
         * @static
         * @param {neutron.IPlayVideoRequest=} [properties] Properties to set
         * @returns {neutron.PlayVideoRequest} PlayVideoRequest instance
         */
        PlayVideoRequest.create = function create(properties) {
            return new PlayVideoRequest(properties);
        };

        /**
         * Encodes the specified PlayVideoRequest message. Does not implicitly {@link neutron.PlayVideoRequest.verify|verify} messages.
         * @function encode
         * @memberof neutron.PlayVideoRequest
         * @static
         * @param {neutron.IPlayVideoRequest} message PlayVideoRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayVideoRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
            return writer;
        };

        /**
         * Encodes the specified PlayVideoRequest message, length delimited. Does not implicitly {@link neutron.PlayVideoRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.PlayVideoRequest
         * @static
         * @param {neutron.IPlayVideoRequest} message PlayVideoRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayVideoRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PlayVideoRequest message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.PlayVideoRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.PlayVideoRequest} PlayVideoRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayVideoRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.PlayVideoRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.path = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PlayVideoRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.PlayVideoRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.PlayVideoRequest} PlayVideoRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayVideoRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PlayVideoRequest message.
         * @function verify
         * @memberof neutron.PlayVideoRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PlayVideoRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.path != null && message.hasOwnProperty("path"))
                if (!$util.isString(message.path))
                    return "path: string expected";
            return null;
        };

        /**
         * Creates a PlayVideoRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.PlayVideoRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.PlayVideoRequest} PlayVideoRequest
         */
        PlayVideoRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.PlayVideoRequest)
                return object;
            let message = new $root.neutron.PlayVideoRequest();
            if (object.path != null)
                message.path = String(object.path);
            return message;
        };

        /**
         * Creates a plain object from a PlayVideoRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.PlayVideoRequest
         * @static
         * @param {neutron.PlayVideoRequest} message PlayVideoRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PlayVideoRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.path = "";
            if (message.path != null && message.hasOwnProperty("path"))
                object.path = message.path;
            return object;
        };

        /**
         * Converts this PlayVideoRequest to JSON.
         * @function toJSON
         * @memberof neutron.PlayVideoRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PlayVideoRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PlayVideoRequest
         * @function getTypeUrl
         * @memberof neutron.PlayVideoRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PlayVideoRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.PlayVideoRequest";
        };

        return PlayVideoRequest;
    })();

    neutron.PlayVideoResponse = (function() {

        /**
         * Properties of a PlayVideoResponse.
         * @memberof neutron
         * @interface IPlayVideoResponse
         * @property {Object.<string,google.protobuf.IValue>|null} [videoInfo] PlayVideoResponse videoInfo
         */

        /**
         * Constructs a new PlayVideoResponse.
         * @memberof neutron
         * @classdesc Represents a PlayVideoResponse.
         * @implements IPlayVideoResponse
         * @constructor
         * @param {neutron.IPlayVideoResponse=} [properties] Properties to set
         */
        function PlayVideoResponse(properties) {
            this.videoInfo = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PlayVideoResponse videoInfo.
         * @member {Object.<string,google.protobuf.IValue>} videoInfo
         * @memberof neutron.PlayVideoResponse
         * @instance
         */
        PlayVideoResponse.prototype.videoInfo = $util.emptyObject;

        /**
         * Creates a new PlayVideoResponse instance using the specified properties.
         * @function create
         * @memberof neutron.PlayVideoResponse
         * @static
         * @param {neutron.IPlayVideoResponse=} [properties] Properties to set
         * @returns {neutron.PlayVideoResponse} PlayVideoResponse instance
         */
        PlayVideoResponse.create = function create(properties) {
            return new PlayVideoResponse(properties);
        };

        /**
         * Encodes the specified PlayVideoResponse message. Does not implicitly {@link neutron.PlayVideoResponse.verify|verify} messages.
         * @function encode
         * @memberof neutron.PlayVideoResponse
         * @static
         * @param {neutron.IPlayVideoResponse} message PlayVideoResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayVideoResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.videoInfo != null && Object.hasOwnProperty.call(message, "videoInfo"))
                for (let keys = Object.keys(message.videoInfo), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.google.protobuf.Value.encode(message.videoInfo[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            return writer;
        };

        /**
         * Encodes the specified PlayVideoResponse message, length delimited. Does not implicitly {@link neutron.PlayVideoResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.PlayVideoResponse
         * @static
         * @param {neutron.IPlayVideoResponse} message PlayVideoResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayVideoResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PlayVideoResponse message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.PlayVideoResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.PlayVideoResponse} PlayVideoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayVideoResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.PlayVideoResponse(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 3: {
                        if (message.videoInfo === $util.emptyObject)
                            message.videoInfo = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.google.protobuf.Value.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.videoInfo[key] = value;
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PlayVideoResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.PlayVideoResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.PlayVideoResponse} PlayVideoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayVideoResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PlayVideoResponse message.
         * @function verify
         * @memberof neutron.PlayVideoResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PlayVideoResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.videoInfo != null && message.hasOwnProperty("videoInfo")) {
                if (!$util.isObject(message.videoInfo))
                    return "videoInfo: object expected";
                let key = Object.keys(message.videoInfo);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.google.protobuf.Value.verify(message.videoInfo[key[i]]);
                    if (error)
                        return "videoInfo." + error;
                }
            }
            return null;
        };

        /**
         * Creates a PlayVideoResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.PlayVideoResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.PlayVideoResponse} PlayVideoResponse
         */
        PlayVideoResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.PlayVideoResponse)
                return object;
            let message = new $root.neutron.PlayVideoResponse();
            if (object.videoInfo) {
                if (typeof object.videoInfo !== "object")
                    throw TypeError(".neutron.PlayVideoResponse.videoInfo: object expected");
                message.videoInfo = {};
                for (let keys = Object.keys(object.videoInfo), i = 0; i < keys.length; ++i) {
                    if (typeof object.videoInfo[keys[i]] !== "object")
                        throw TypeError(".neutron.PlayVideoResponse.videoInfo: object expected");
                    message.videoInfo[keys[i]] = $root.google.protobuf.Value.fromObject(object.videoInfo[keys[i]]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a PlayVideoResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.PlayVideoResponse
         * @static
         * @param {neutron.PlayVideoResponse} message PlayVideoResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PlayVideoResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.videoInfo = {};
            let keys2;
            if (message.videoInfo && (keys2 = Object.keys(message.videoInfo)).length) {
                object.videoInfo = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.videoInfo[keys2[j]] = $root.google.protobuf.Value.toObject(message.videoInfo[keys2[j]], options);
            }
            return object;
        };

        /**
         * Converts this PlayVideoResponse to JSON.
         * @function toJSON
         * @memberof neutron.PlayVideoResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PlayVideoResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PlayVideoResponse
         * @function getTypeUrl
         * @memberof neutron.PlayVideoResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PlayVideoResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.PlayVideoResponse";
        };

        return PlayVideoResponse;
    })();

    neutron.ErrorMessage = (function() {

        /**
         * Properties of an ErrorMessage.
         * @memberof neutron
         * @interface IErrorMessage
         * @property {boolean|null} [success] ErrorMessage success
         * @property {string|null} [error] ErrorMessage error
         * @property {google.protobuf.IStruct|null} [details] ErrorMessage details
         */

        /**
         * Constructs a new ErrorMessage.
         * @memberof neutron
         * @classdesc Represents an ErrorMessage.
         * @implements IErrorMessage
         * @constructor
         * @param {neutron.IErrorMessage=} [properties] Properties to set
         */
        function ErrorMessage(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ErrorMessage success.
         * @member {boolean} success
         * @memberof neutron.ErrorMessage
         * @instance
         */
        ErrorMessage.prototype.success = false;

        /**
         * ErrorMessage error.
         * @member {string} error
         * @memberof neutron.ErrorMessage
         * @instance
         */
        ErrorMessage.prototype.error = "";

        /**
         * ErrorMessage details.
         * @member {google.protobuf.IStruct|null|undefined} details
         * @memberof neutron.ErrorMessage
         * @instance
         */
        ErrorMessage.prototype.details = null;

        /**
         * Creates a new ErrorMessage instance using the specified properties.
         * @function create
         * @memberof neutron.ErrorMessage
         * @static
         * @param {neutron.IErrorMessage=} [properties] Properties to set
         * @returns {neutron.ErrorMessage} ErrorMessage instance
         */
        ErrorMessage.create = function create(properties) {
            return new ErrorMessage(properties);
        };

        /**
         * Encodes the specified ErrorMessage message. Does not implicitly {@link neutron.ErrorMessage.verify|verify} messages.
         * @function encode
         * @memberof neutron.ErrorMessage
         * @static
         * @param {neutron.IErrorMessage} message ErrorMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ErrorMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.error);
            if (message.details != null && Object.hasOwnProperty.call(message, "details"))
                $root.google.protobuf.Struct.encode(message.details, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ErrorMessage message, length delimited. Does not implicitly {@link neutron.ErrorMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.ErrorMessage
         * @static
         * @param {neutron.IErrorMessage} message ErrorMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ErrorMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ErrorMessage message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.ErrorMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.ErrorMessage} ErrorMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ErrorMessage.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.ErrorMessage();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.success = reader.bool();
                        break;
                    }
                case 2: {
                        message.error = reader.string();
                        break;
                    }
                case 3: {
                        message.details = $root.google.protobuf.Struct.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ErrorMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.ErrorMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.ErrorMessage} ErrorMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ErrorMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ErrorMessage message.
         * @function verify
         * @memberof neutron.ErrorMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ErrorMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.success != null && message.hasOwnProperty("success"))
                if (typeof message.success !== "boolean")
                    return "success: boolean expected";
            if (message.error != null && message.hasOwnProperty("error"))
                if (!$util.isString(message.error))
                    return "error: string expected";
            if (message.details != null && message.hasOwnProperty("details")) {
                let error = $root.google.protobuf.Struct.verify(message.details);
                if (error)
                    return "details." + error;
            }
            return null;
        };

        /**
         * Creates an ErrorMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.ErrorMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.ErrorMessage} ErrorMessage
         */
        ErrorMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.ErrorMessage)
                return object;
            let message = new $root.neutron.ErrorMessage();
            if (object.success != null)
                message.success = Boolean(object.success);
            if (object.error != null)
                message.error = String(object.error);
            if (object.details != null) {
                if (typeof object.details !== "object")
                    throw TypeError(".neutron.ErrorMessage.details: object expected");
                message.details = $root.google.protobuf.Struct.fromObject(object.details);
            }
            return message;
        };

        /**
         * Creates a plain object from an ErrorMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.ErrorMessage
         * @static
         * @param {neutron.ErrorMessage} message ErrorMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ErrorMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.success = false;
                object.error = "";
                object.details = null;
            }
            if (message.success != null && message.hasOwnProperty("success"))
                object.success = message.success;
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = message.error;
            if (message.details != null && message.hasOwnProperty("details"))
                object.details = $root.google.protobuf.Struct.toObject(message.details, options);
            return object;
        };

        /**
         * Converts this ErrorMessage to JSON.
         * @function toJSON
         * @memberof neutron.ErrorMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ErrorMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ErrorMessage
         * @function getTypeUrl
         * @memberof neutron.ErrorMessage
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ErrorMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.ErrorMessage";
        };

        return ErrorMessage;
    })();

    neutron.RemoteMessage = (function() {

        /**
         * Properties of a RemoteMessage.
         * @memberof neutron
         * @interface IRemoteMessage
         * @property {string|null} [type] RemoteMessage type
         * @property {string|null} [source] RemoteMessage source
         * @property {string|null} [destination] RemoteMessage destination
         * @property {string|null} [id] RemoteMessage id
         * @property {google.protobuf.IAny|null} [any] RemoteMessage any
         * @property {Uint8Array|null} [rawData] RemoteMessage rawData
         * @property {neutron.IErrorMessage|null} [error] RemoteMessage error
         * @property {neutron.ILoginRequest|null} [loginRequest] RemoteMessage loginRequest
         * @property {neutron.ILoginResponse|null} [loginResponse] RemoteMessage loginResponse
         * @property {neutron.IFileInformation|null} [fileInformation] RemoteMessage fileInformation
         * @property {neutron.IImageRepoHistoryRequest|null} [imageRepoHistoryRequest] RemoteMessage imageRepoHistoryRequest
         * @property {neutron.IImageRepoHistoryItem|null} [imageRepoHistoryItem] RemoteMessage imageRepoHistoryItem
         * @property {neutron.IImageRepoHistoryResponse|null} [imageRepoHistoryResponse] RemoteMessage imageRepoHistoryResponse
         * @property {neutron.IImageRepoPageRequest|null} [imageRepoPageRequest] RemoteMessage imageRepoPageRequest
         * @property {neutron.IImageRepoPageResponse|null} [imageRepoPageResponse] RemoteMessage imageRepoPageResponse
         * @property {neutron.IPrepareFileReceiveRequest|null} [prepareFileReceiveRequest] RemoteMessage prepareFileReceiveRequest
         * @property {neutron.IPrepareFileReceiveResponse|null} [prepareFileReceiveResponse] RemoteMessage prepareFileReceiveResponse
         * @property {neutron.IGetFileInfoRequest|null} [getFileInfoRequest] RemoteMessage getFileInfoRequest
         * @property {neutron.IListFilesRequest|null} [listFilesRequest] RemoteMessage listFilesRequest
         * @property {neutron.IListFilesResponse|null} [listFilesResponse] RemoteMessage listFilesResponse
         * @property {neutron.IGetFileSystemVersionRequest|null} [getFileSystemVersionRequest] RemoteMessage getFileSystemVersionRequest
         * @property {neutron.IGetFileSystemVersionResponse|null} [getFileSystemVersionResponse] RemoteMessage getFileSystemVersionResponse
         * @property {neutron.IGetThumbnailRequest|null} [getThumbnailRequest] RemoteMessage getThumbnailRequest
         * @property {neutron.IGetThumbnailResponse|null} [getThumbnailResponse] RemoteMessage getThumbnailResponse
         * @property {neutron.IPlayVideoRequest|null} [playVideoRequest] RemoteMessage playVideoRequest
         * @property {neutron.IPlayVideoResponse|null} [playVideoResponse] RemoteMessage playVideoResponse
         * @property {neutron.IWebRTCOfferContent|null} [webrtcOfferContent] RemoteMessage webrtcOfferContent
         * @property {neutron.IWebRTCAnswerContent|null} [webrtcAnswerContent] RemoteMessage webrtcAnswerContent
         * @property {neutron.IWebRTCAnswerCandidatesContent|null} [webrtcAnswerCandidatesContent] RemoteMessage webrtcAnswerCandidatesContent
         * @property {neutron.IWebRTCCandidateContent|null} [webrtcCandidateContent] RemoteMessage webrtcCandidateContent
         */

        /**
         * Constructs a new RemoteMessage.
         * @memberof neutron
         * @classdesc Represents a RemoteMessage.
         * @implements IRemoteMessage
         * @constructor
         * @param {neutron.IRemoteMessage=} [properties] Properties to set
         */
        function RemoteMessage(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RemoteMessage type.
         * @member {string} type
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.type = "";

        /**
         * RemoteMessage source.
         * @member {string} source
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.source = "";

        /**
         * RemoteMessage destination.
         * @member {string} destination
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.destination = "";

        /**
         * RemoteMessage id.
         * @member {string} id
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.id = "";

        /**
         * RemoteMessage any.
         * @member {google.protobuf.IAny|null|undefined} any
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.any = null;

        /**
         * RemoteMessage rawData.
         * @member {Uint8Array|null|undefined} rawData
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.rawData = null;

        /**
         * RemoteMessage error.
         * @member {neutron.IErrorMessage|null|undefined} error
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.error = null;

        /**
         * RemoteMessage loginRequest.
         * @member {neutron.ILoginRequest|null|undefined} loginRequest
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.loginRequest = null;

        /**
         * RemoteMessage loginResponse.
         * @member {neutron.ILoginResponse|null|undefined} loginResponse
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.loginResponse = null;

        /**
         * RemoteMessage fileInformation.
         * @member {neutron.IFileInformation|null|undefined} fileInformation
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.fileInformation = null;

        /**
         * RemoteMessage imageRepoHistoryRequest.
         * @member {neutron.IImageRepoHistoryRequest|null|undefined} imageRepoHistoryRequest
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.imageRepoHistoryRequest = null;

        /**
         * RemoteMessage imageRepoHistoryItem.
         * @member {neutron.IImageRepoHistoryItem|null|undefined} imageRepoHistoryItem
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.imageRepoHistoryItem = null;

        /**
         * RemoteMessage imageRepoHistoryResponse.
         * @member {neutron.IImageRepoHistoryResponse|null|undefined} imageRepoHistoryResponse
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.imageRepoHistoryResponse = null;

        /**
         * RemoteMessage imageRepoPageRequest.
         * @member {neutron.IImageRepoPageRequest|null|undefined} imageRepoPageRequest
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.imageRepoPageRequest = null;

        /**
         * RemoteMessage imageRepoPageResponse.
         * @member {neutron.IImageRepoPageResponse|null|undefined} imageRepoPageResponse
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.imageRepoPageResponse = null;

        /**
         * RemoteMessage prepareFileReceiveRequest.
         * @member {neutron.IPrepareFileReceiveRequest|null|undefined} prepareFileReceiveRequest
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.prepareFileReceiveRequest = null;

        /**
         * RemoteMessage prepareFileReceiveResponse.
         * @member {neutron.IPrepareFileReceiveResponse|null|undefined} prepareFileReceiveResponse
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.prepareFileReceiveResponse = null;

        /**
         * RemoteMessage getFileInfoRequest.
         * @member {neutron.IGetFileInfoRequest|null|undefined} getFileInfoRequest
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.getFileInfoRequest = null;

        /**
         * RemoteMessage listFilesRequest.
         * @member {neutron.IListFilesRequest|null|undefined} listFilesRequest
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.listFilesRequest = null;

        /**
         * RemoteMessage listFilesResponse.
         * @member {neutron.IListFilesResponse|null|undefined} listFilesResponse
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.listFilesResponse = null;

        /**
         * RemoteMessage getFileSystemVersionRequest.
         * @member {neutron.IGetFileSystemVersionRequest|null|undefined} getFileSystemVersionRequest
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.getFileSystemVersionRequest = null;

        /**
         * RemoteMessage getFileSystemVersionResponse.
         * @member {neutron.IGetFileSystemVersionResponse|null|undefined} getFileSystemVersionResponse
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.getFileSystemVersionResponse = null;

        /**
         * RemoteMessage getThumbnailRequest.
         * @member {neutron.IGetThumbnailRequest|null|undefined} getThumbnailRequest
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.getThumbnailRequest = null;

        /**
         * RemoteMessage getThumbnailResponse.
         * @member {neutron.IGetThumbnailResponse|null|undefined} getThumbnailResponse
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.getThumbnailResponse = null;

        /**
         * RemoteMessage playVideoRequest.
         * @member {neutron.IPlayVideoRequest|null|undefined} playVideoRequest
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.playVideoRequest = null;

        /**
         * RemoteMessage playVideoResponse.
         * @member {neutron.IPlayVideoResponse|null|undefined} playVideoResponse
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.playVideoResponse = null;

        /**
         * RemoteMessage webrtcOfferContent.
         * @member {neutron.IWebRTCOfferContent|null|undefined} webrtcOfferContent
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.webrtcOfferContent = null;

        /**
         * RemoteMessage webrtcAnswerContent.
         * @member {neutron.IWebRTCAnswerContent|null|undefined} webrtcAnswerContent
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.webrtcAnswerContent = null;

        /**
         * RemoteMessage webrtcAnswerCandidatesContent.
         * @member {neutron.IWebRTCAnswerCandidatesContent|null|undefined} webrtcAnswerCandidatesContent
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.webrtcAnswerCandidatesContent = null;

        /**
         * RemoteMessage webrtcCandidateContent.
         * @member {neutron.IWebRTCCandidateContent|null|undefined} webrtcCandidateContent
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.webrtcCandidateContent = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        /**
         * RemoteMessage payload.
         * @member {"any"|"rawData"|"error"|"loginRequest"|"loginResponse"|"fileInformation"|"imageRepoHistoryRequest"|"imageRepoHistoryItem"|"imageRepoHistoryResponse"|"imageRepoPageRequest"|"imageRepoPageResponse"|"prepareFileReceiveRequest"|"prepareFileReceiveResponse"|"getFileInfoRequest"|"listFilesRequest"|"listFilesResponse"|"getFileSystemVersionRequest"|"getFileSystemVersionResponse"|"getThumbnailRequest"|"getThumbnailResponse"|"playVideoRequest"|"playVideoResponse"|"webrtcOfferContent"|"webrtcAnswerContent"|"webrtcAnswerCandidatesContent"|"webrtcCandidateContent"|undefined} payload
         * @memberof neutron.RemoteMessage
         * @instance
         */
        Object.defineProperty(RemoteMessage.prototype, "payload", {
            get: $util.oneOfGetter($oneOfFields = ["any", "rawData", "error", "loginRequest", "loginResponse", "fileInformation", "imageRepoHistoryRequest", "imageRepoHistoryItem", "imageRepoHistoryResponse", "imageRepoPageRequest", "imageRepoPageResponse", "prepareFileReceiveRequest", "prepareFileReceiveResponse", "getFileInfoRequest", "listFilesRequest", "listFilesResponse", "getFileSystemVersionRequest", "getFileSystemVersionResponse", "getThumbnailRequest", "getThumbnailResponse", "playVideoRequest", "playVideoResponse", "webrtcOfferContent", "webrtcAnswerContent", "webrtcAnswerCandidatesContent", "webrtcCandidateContent"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new RemoteMessage instance using the specified properties.
         * @function create
         * @memberof neutron.RemoteMessage
         * @static
         * @param {neutron.IRemoteMessage=} [properties] Properties to set
         * @returns {neutron.RemoteMessage} RemoteMessage instance
         */
        RemoteMessage.create = function create(properties) {
            return new RemoteMessage(properties);
        };

        /**
         * Encodes the specified RemoteMessage message. Does not implicitly {@link neutron.RemoteMessage.verify|verify} messages.
         * @function encode
         * @memberof neutron.RemoteMessage
         * @static
         * @param {neutron.IRemoteMessage} message RemoteMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RemoteMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.type);
            if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.source);
            if (message.destination != null && Object.hasOwnProperty.call(message, "destination"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.destination);
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.id);
            if (message.any != null && Object.hasOwnProperty.call(message, "any"))
                $root.google.protobuf.Any.encode(message.any, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.rawData != null && Object.hasOwnProperty.call(message, "rawData"))
                writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.rawData);
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                $root.neutron.ErrorMessage.encode(message.error, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.loginRequest != null && Object.hasOwnProperty.call(message, "loginRequest"))
                $root.neutron.LoginRequest.encode(message.loginRequest, writer.uint32(/* id 1000, wireType 2 =*/8002).fork()).ldelim();
            if (message.loginResponse != null && Object.hasOwnProperty.call(message, "loginResponse"))
                $root.neutron.LoginResponse.encode(message.loginResponse, writer.uint32(/* id 1001, wireType 2 =*/8010).fork()).ldelim();
            if (message.fileInformation != null && Object.hasOwnProperty.call(message, "fileInformation"))
                $root.neutron.FileInformation.encode(message.fileInformation, writer.uint32(/* id 1501, wireType 2 =*/12010).fork()).ldelim();
            if (message.imageRepoHistoryRequest != null && Object.hasOwnProperty.call(message, "imageRepoHistoryRequest"))
                $root.neutron.ImageRepoHistoryRequest.encode(message.imageRepoHistoryRequest, writer.uint32(/* id 1502, wireType 2 =*/12018).fork()).ldelim();
            if (message.imageRepoHistoryItem != null && Object.hasOwnProperty.call(message, "imageRepoHistoryItem"))
                $root.neutron.ImageRepoHistoryItem.encode(message.imageRepoHistoryItem, writer.uint32(/* id 1503, wireType 2 =*/12026).fork()).ldelim();
            if (message.imageRepoHistoryResponse != null && Object.hasOwnProperty.call(message, "imageRepoHistoryResponse"))
                $root.neutron.ImageRepoHistoryResponse.encode(message.imageRepoHistoryResponse, writer.uint32(/* id 1504, wireType 2 =*/12034).fork()).ldelim();
            if (message.imageRepoPageRequest != null && Object.hasOwnProperty.call(message, "imageRepoPageRequest"))
                $root.neutron.ImageRepoPageRequest.encode(message.imageRepoPageRequest, writer.uint32(/* id 1505, wireType 2 =*/12042).fork()).ldelim();
            if (message.imageRepoPageResponse != null && Object.hasOwnProperty.call(message, "imageRepoPageResponse"))
                $root.neutron.ImageRepoPageResponse.encode(message.imageRepoPageResponse, writer.uint32(/* id 1506, wireType 2 =*/12050).fork()).ldelim();
            if (message.prepareFileReceiveRequest != null && Object.hasOwnProperty.call(message, "prepareFileReceiveRequest"))
                $root.neutron.PrepareFileReceiveRequest.encode(message.prepareFileReceiveRequest, writer.uint32(/* id 1507, wireType 2 =*/12058).fork()).ldelim();
            if (message.prepareFileReceiveResponse != null && Object.hasOwnProperty.call(message, "prepareFileReceiveResponse"))
                $root.neutron.PrepareFileReceiveResponse.encode(message.prepareFileReceiveResponse, writer.uint32(/* id 1508, wireType 2 =*/12066).fork()).ldelim();
            if (message.getFileInfoRequest != null && Object.hasOwnProperty.call(message, "getFileInfoRequest"))
                $root.neutron.GetFileInfoRequest.encode(message.getFileInfoRequest, writer.uint32(/* id 1509, wireType 2 =*/12074).fork()).ldelim();
            if (message.listFilesRequest != null && Object.hasOwnProperty.call(message, "listFilesRequest"))
                $root.neutron.ListFilesRequest.encode(message.listFilesRequest, writer.uint32(/* id 1511, wireType 2 =*/12090).fork()).ldelim();
            if (message.listFilesResponse != null && Object.hasOwnProperty.call(message, "listFilesResponse"))
                $root.neutron.ListFilesResponse.encode(message.listFilesResponse, writer.uint32(/* id 1512, wireType 2 =*/12098).fork()).ldelim();
            if (message.getFileSystemVersionRequest != null && Object.hasOwnProperty.call(message, "getFileSystemVersionRequest"))
                $root.neutron.GetFileSystemVersionRequest.encode(message.getFileSystemVersionRequest, writer.uint32(/* id 1513, wireType 2 =*/12106).fork()).ldelim();
            if (message.getFileSystemVersionResponse != null && Object.hasOwnProperty.call(message, "getFileSystemVersionResponse"))
                $root.neutron.GetFileSystemVersionResponse.encode(message.getFileSystemVersionResponse, writer.uint32(/* id 1514, wireType 2 =*/12114).fork()).ldelim();
            if (message.getThumbnailRequest != null && Object.hasOwnProperty.call(message, "getThumbnailRequest"))
                $root.neutron.GetThumbnailRequest.encode(message.getThumbnailRequest, writer.uint32(/* id 1515, wireType 2 =*/12122).fork()).ldelim();
            if (message.getThumbnailResponse != null && Object.hasOwnProperty.call(message, "getThumbnailResponse"))
                $root.neutron.GetThumbnailResponse.encode(message.getThumbnailResponse, writer.uint32(/* id 1516, wireType 2 =*/12130).fork()).ldelim();
            if (message.playVideoRequest != null && Object.hasOwnProperty.call(message, "playVideoRequest"))
                $root.neutron.PlayVideoRequest.encode(message.playVideoRequest, writer.uint32(/* id 1517, wireType 2 =*/12138).fork()).ldelim();
            if (message.playVideoResponse != null && Object.hasOwnProperty.call(message, "playVideoResponse"))
                $root.neutron.PlayVideoResponse.encode(message.playVideoResponse, writer.uint32(/* id 1518, wireType 2 =*/12146).fork()).ldelim();
            if (message.webrtcOfferContent != null && Object.hasOwnProperty.call(message, "webrtcOfferContent"))
                $root.neutron.WebRTCOfferContent.encode(message.webrtcOfferContent, writer.uint32(/* id 2000, wireType 2 =*/16002).fork()).ldelim();
            if (message.webrtcAnswerContent != null && Object.hasOwnProperty.call(message, "webrtcAnswerContent"))
                $root.neutron.WebRTCAnswerContent.encode(message.webrtcAnswerContent, writer.uint32(/* id 2001, wireType 2 =*/16010).fork()).ldelim();
            if (message.webrtcAnswerCandidatesContent != null && Object.hasOwnProperty.call(message, "webrtcAnswerCandidatesContent"))
                $root.neutron.WebRTCAnswerCandidatesContent.encode(message.webrtcAnswerCandidatesContent, writer.uint32(/* id 2002, wireType 2 =*/16018).fork()).ldelim();
            if (message.webrtcCandidateContent != null && Object.hasOwnProperty.call(message, "webrtcCandidateContent"))
                $root.neutron.WebRTCCandidateContent.encode(message.webrtcCandidateContent, writer.uint32(/* id 2003, wireType 2 =*/16026).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified RemoteMessage message, length delimited. Does not implicitly {@link neutron.RemoteMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.RemoteMessage
         * @static
         * @param {neutron.IRemoteMessage} message RemoteMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RemoteMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RemoteMessage message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.RemoteMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.RemoteMessage} RemoteMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RemoteMessage.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.RemoteMessage();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.type = reader.string();
                        break;
                    }
                case 2: {
                        message.source = reader.string();
                        break;
                    }
                case 3: {
                        message.destination = reader.string();
                        break;
                    }
                case 4: {
                        message.id = reader.string();
                        break;
                    }
                case 5: {
                        message.any = $root.google.protobuf.Any.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.rawData = reader.bytes();
                        break;
                    }
                case 7: {
                        message.error = $root.neutron.ErrorMessage.decode(reader, reader.uint32());
                        break;
                    }
                case 1000: {
                        message.loginRequest = $root.neutron.LoginRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 1001: {
                        message.loginResponse = $root.neutron.LoginResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 1501: {
                        message.fileInformation = $root.neutron.FileInformation.decode(reader, reader.uint32());
                        break;
                    }
                case 1502: {
                        message.imageRepoHistoryRequest = $root.neutron.ImageRepoHistoryRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 1503: {
                        message.imageRepoHistoryItem = $root.neutron.ImageRepoHistoryItem.decode(reader, reader.uint32());
                        break;
                    }
                case 1504: {
                        message.imageRepoHistoryResponse = $root.neutron.ImageRepoHistoryResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 1505: {
                        message.imageRepoPageRequest = $root.neutron.ImageRepoPageRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 1506: {
                        message.imageRepoPageResponse = $root.neutron.ImageRepoPageResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 1507: {
                        message.prepareFileReceiveRequest = $root.neutron.PrepareFileReceiveRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 1508: {
                        message.prepareFileReceiveResponse = $root.neutron.PrepareFileReceiveResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 1509: {
                        message.getFileInfoRequest = $root.neutron.GetFileInfoRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 1511: {
                        message.listFilesRequest = $root.neutron.ListFilesRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 1512: {
                        message.listFilesResponse = $root.neutron.ListFilesResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 1513: {
                        message.getFileSystemVersionRequest = $root.neutron.GetFileSystemVersionRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 1514: {
                        message.getFileSystemVersionResponse = $root.neutron.GetFileSystemVersionResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 1515: {
                        message.getThumbnailRequest = $root.neutron.GetThumbnailRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 1516: {
                        message.getThumbnailResponse = $root.neutron.GetThumbnailResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 1517: {
                        message.playVideoRequest = $root.neutron.PlayVideoRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 1518: {
                        message.playVideoResponse = $root.neutron.PlayVideoResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 2000: {
                        message.webrtcOfferContent = $root.neutron.WebRTCOfferContent.decode(reader, reader.uint32());
                        break;
                    }
                case 2001: {
                        message.webrtcAnswerContent = $root.neutron.WebRTCAnswerContent.decode(reader, reader.uint32());
                        break;
                    }
                case 2002: {
                        message.webrtcAnswerCandidatesContent = $root.neutron.WebRTCAnswerCandidatesContent.decode(reader, reader.uint32());
                        break;
                    }
                case 2003: {
                        message.webrtcCandidateContent = $root.neutron.WebRTCCandidateContent.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RemoteMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.RemoteMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.RemoteMessage} RemoteMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RemoteMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RemoteMessage message.
         * @function verify
         * @memberof neutron.RemoteMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RemoteMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.source != null && message.hasOwnProperty("source"))
                if (!$util.isString(message.source))
                    return "source: string expected";
            if (message.destination != null && message.hasOwnProperty("destination"))
                if (!$util.isString(message.destination))
                    return "destination: string expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.any != null && message.hasOwnProperty("any")) {
                properties.payload = 1;
                {
                    let error = $root.google.protobuf.Any.verify(message.any);
                    if (error)
                        return "any." + error;
                }
            }
            if (message.rawData != null && message.hasOwnProperty("rawData")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                if (!(message.rawData && typeof message.rawData.length === "number" || $util.isString(message.rawData)))
                    return "rawData: buffer expected";
            }
            if (message.error != null && message.hasOwnProperty("error")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.ErrorMessage.verify(message.error);
                    if (error)
                        return "error." + error;
                }
            }
            if (message.loginRequest != null && message.hasOwnProperty("loginRequest")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.LoginRequest.verify(message.loginRequest);
                    if (error)
                        return "loginRequest." + error;
                }
            }
            if (message.loginResponse != null && message.hasOwnProperty("loginResponse")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.LoginResponse.verify(message.loginResponse);
                    if (error)
                        return "loginResponse." + error;
                }
            }
            if (message.fileInformation != null && message.hasOwnProperty("fileInformation")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.FileInformation.verify(message.fileInformation);
                    if (error)
                        return "fileInformation." + error;
                }
            }
            if (message.imageRepoHistoryRequest != null && message.hasOwnProperty("imageRepoHistoryRequest")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.ImageRepoHistoryRequest.verify(message.imageRepoHistoryRequest);
                    if (error)
                        return "imageRepoHistoryRequest." + error;
                }
            }
            if (message.imageRepoHistoryItem != null && message.hasOwnProperty("imageRepoHistoryItem")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.ImageRepoHistoryItem.verify(message.imageRepoHistoryItem);
                    if (error)
                        return "imageRepoHistoryItem." + error;
                }
            }
            if (message.imageRepoHistoryResponse != null && message.hasOwnProperty("imageRepoHistoryResponse")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.ImageRepoHistoryResponse.verify(message.imageRepoHistoryResponse);
                    if (error)
                        return "imageRepoHistoryResponse." + error;
                }
            }
            if (message.imageRepoPageRequest != null && message.hasOwnProperty("imageRepoPageRequest")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.ImageRepoPageRequest.verify(message.imageRepoPageRequest);
                    if (error)
                        return "imageRepoPageRequest." + error;
                }
            }
            if (message.imageRepoPageResponse != null && message.hasOwnProperty("imageRepoPageResponse")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.ImageRepoPageResponse.verify(message.imageRepoPageResponse);
                    if (error)
                        return "imageRepoPageResponse." + error;
                }
            }
            if (message.prepareFileReceiveRequest != null && message.hasOwnProperty("prepareFileReceiveRequest")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.PrepareFileReceiveRequest.verify(message.prepareFileReceiveRequest);
                    if (error)
                        return "prepareFileReceiveRequest." + error;
                }
            }
            if (message.prepareFileReceiveResponse != null && message.hasOwnProperty("prepareFileReceiveResponse")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.PrepareFileReceiveResponse.verify(message.prepareFileReceiveResponse);
                    if (error)
                        return "prepareFileReceiveResponse." + error;
                }
            }
            if (message.getFileInfoRequest != null && message.hasOwnProperty("getFileInfoRequest")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.GetFileInfoRequest.verify(message.getFileInfoRequest);
                    if (error)
                        return "getFileInfoRequest." + error;
                }
            }
            if (message.listFilesRequest != null && message.hasOwnProperty("listFilesRequest")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.ListFilesRequest.verify(message.listFilesRequest);
                    if (error)
                        return "listFilesRequest." + error;
                }
            }
            if (message.listFilesResponse != null && message.hasOwnProperty("listFilesResponse")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.ListFilesResponse.verify(message.listFilesResponse);
                    if (error)
                        return "listFilesResponse." + error;
                }
            }
            if (message.getFileSystemVersionRequest != null && message.hasOwnProperty("getFileSystemVersionRequest")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.GetFileSystemVersionRequest.verify(message.getFileSystemVersionRequest);
                    if (error)
                        return "getFileSystemVersionRequest." + error;
                }
            }
            if (message.getFileSystemVersionResponse != null && message.hasOwnProperty("getFileSystemVersionResponse")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.GetFileSystemVersionResponse.verify(message.getFileSystemVersionResponse);
                    if (error)
                        return "getFileSystemVersionResponse." + error;
                }
            }
            if (message.getThumbnailRequest != null && message.hasOwnProperty("getThumbnailRequest")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.GetThumbnailRequest.verify(message.getThumbnailRequest);
                    if (error)
                        return "getThumbnailRequest." + error;
                }
            }
            if (message.getThumbnailResponse != null && message.hasOwnProperty("getThumbnailResponse")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.GetThumbnailResponse.verify(message.getThumbnailResponse);
                    if (error)
                        return "getThumbnailResponse." + error;
                }
            }
            if (message.playVideoRequest != null && message.hasOwnProperty("playVideoRequest")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.PlayVideoRequest.verify(message.playVideoRequest);
                    if (error)
                        return "playVideoRequest." + error;
                }
            }
            if (message.playVideoResponse != null && message.hasOwnProperty("playVideoResponse")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.PlayVideoResponse.verify(message.playVideoResponse);
                    if (error)
                        return "playVideoResponse." + error;
                }
            }
            if (message.webrtcOfferContent != null && message.hasOwnProperty("webrtcOfferContent")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.WebRTCOfferContent.verify(message.webrtcOfferContent);
                    if (error)
                        return "webrtcOfferContent." + error;
                }
            }
            if (message.webrtcAnswerContent != null && message.hasOwnProperty("webrtcAnswerContent")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.WebRTCAnswerContent.verify(message.webrtcAnswerContent);
                    if (error)
                        return "webrtcAnswerContent." + error;
                }
            }
            if (message.webrtcAnswerCandidatesContent != null && message.hasOwnProperty("webrtcAnswerCandidatesContent")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.WebRTCAnswerCandidatesContent.verify(message.webrtcAnswerCandidatesContent);
                    if (error)
                        return "webrtcAnswerCandidatesContent." + error;
                }
            }
            if (message.webrtcCandidateContent != null && message.hasOwnProperty("webrtcCandidateContent")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.neutron.WebRTCCandidateContent.verify(message.webrtcCandidateContent);
                    if (error)
                        return "webrtcCandidateContent." + error;
                }
            }
            return null;
        };

        /**
         * Creates a RemoteMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.RemoteMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.RemoteMessage} RemoteMessage
         */
        RemoteMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.RemoteMessage)
                return object;
            let message = new $root.neutron.RemoteMessage();
            if (object.type != null)
                message.type = String(object.type);
            if (object.source != null)
                message.source = String(object.source);
            if (object.destination != null)
                message.destination = String(object.destination);
            if (object.id != null)
                message.id = String(object.id);
            if (object.any != null) {
                if (typeof object.any !== "object")
                    throw TypeError(".neutron.RemoteMessage.any: object expected");
                message.any = $root.google.protobuf.Any.fromObject(object.any);
            }
            if (object.rawData != null)
                if (typeof object.rawData === "string")
                    $util.base64.decode(object.rawData, message.rawData = $util.newBuffer($util.base64.length(object.rawData)), 0);
                else if (object.rawData.length >= 0)
                    message.rawData = object.rawData;
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".neutron.RemoteMessage.error: object expected");
                message.error = $root.neutron.ErrorMessage.fromObject(object.error);
            }
            if (object.loginRequest != null) {
                if (typeof object.loginRequest !== "object")
                    throw TypeError(".neutron.RemoteMessage.loginRequest: object expected");
                message.loginRequest = $root.neutron.LoginRequest.fromObject(object.loginRequest);
            }
            if (object.loginResponse != null) {
                if (typeof object.loginResponse !== "object")
                    throw TypeError(".neutron.RemoteMessage.loginResponse: object expected");
                message.loginResponse = $root.neutron.LoginResponse.fromObject(object.loginResponse);
            }
            if (object.fileInformation != null) {
                if (typeof object.fileInformation !== "object")
                    throw TypeError(".neutron.RemoteMessage.fileInformation: object expected");
                message.fileInformation = $root.neutron.FileInformation.fromObject(object.fileInformation);
            }
            if (object.imageRepoHistoryRequest != null) {
                if (typeof object.imageRepoHistoryRequest !== "object")
                    throw TypeError(".neutron.RemoteMessage.imageRepoHistoryRequest: object expected");
                message.imageRepoHistoryRequest = $root.neutron.ImageRepoHistoryRequest.fromObject(object.imageRepoHistoryRequest);
            }
            if (object.imageRepoHistoryItem != null) {
                if (typeof object.imageRepoHistoryItem !== "object")
                    throw TypeError(".neutron.RemoteMessage.imageRepoHistoryItem: object expected");
                message.imageRepoHistoryItem = $root.neutron.ImageRepoHistoryItem.fromObject(object.imageRepoHistoryItem);
            }
            if (object.imageRepoHistoryResponse != null) {
                if (typeof object.imageRepoHistoryResponse !== "object")
                    throw TypeError(".neutron.RemoteMessage.imageRepoHistoryResponse: object expected");
                message.imageRepoHistoryResponse = $root.neutron.ImageRepoHistoryResponse.fromObject(object.imageRepoHistoryResponse);
            }
            if (object.imageRepoPageRequest != null) {
                if (typeof object.imageRepoPageRequest !== "object")
                    throw TypeError(".neutron.RemoteMessage.imageRepoPageRequest: object expected");
                message.imageRepoPageRequest = $root.neutron.ImageRepoPageRequest.fromObject(object.imageRepoPageRequest);
            }
            if (object.imageRepoPageResponse != null) {
                if (typeof object.imageRepoPageResponse !== "object")
                    throw TypeError(".neutron.RemoteMessage.imageRepoPageResponse: object expected");
                message.imageRepoPageResponse = $root.neutron.ImageRepoPageResponse.fromObject(object.imageRepoPageResponse);
            }
            if (object.prepareFileReceiveRequest != null) {
                if (typeof object.prepareFileReceiveRequest !== "object")
                    throw TypeError(".neutron.RemoteMessage.prepareFileReceiveRequest: object expected");
                message.prepareFileReceiveRequest = $root.neutron.PrepareFileReceiveRequest.fromObject(object.prepareFileReceiveRequest);
            }
            if (object.prepareFileReceiveResponse != null) {
                if (typeof object.prepareFileReceiveResponse !== "object")
                    throw TypeError(".neutron.RemoteMessage.prepareFileReceiveResponse: object expected");
                message.prepareFileReceiveResponse = $root.neutron.PrepareFileReceiveResponse.fromObject(object.prepareFileReceiveResponse);
            }
            if (object.getFileInfoRequest != null) {
                if (typeof object.getFileInfoRequest !== "object")
                    throw TypeError(".neutron.RemoteMessage.getFileInfoRequest: object expected");
                message.getFileInfoRequest = $root.neutron.GetFileInfoRequest.fromObject(object.getFileInfoRequest);
            }
            if (object.listFilesRequest != null) {
                if (typeof object.listFilesRequest !== "object")
                    throw TypeError(".neutron.RemoteMessage.listFilesRequest: object expected");
                message.listFilesRequest = $root.neutron.ListFilesRequest.fromObject(object.listFilesRequest);
            }
            if (object.listFilesResponse != null) {
                if (typeof object.listFilesResponse !== "object")
                    throw TypeError(".neutron.RemoteMessage.listFilesResponse: object expected");
                message.listFilesResponse = $root.neutron.ListFilesResponse.fromObject(object.listFilesResponse);
            }
            if (object.getFileSystemVersionRequest != null) {
                if (typeof object.getFileSystemVersionRequest !== "object")
                    throw TypeError(".neutron.RemoteMessage.getFileSystemVersionRequest: object expected");
                message.getFileSystemVersionRequest = $root.neutron.GetFileSystemVersionRequest.fromObject(object.getFileSystemVersionRequest);
            }
            if (object.getFileSystemVersionResponse != null) {
                if (typeof object.getFileSystemVersionResponse !== "object")
                    throw TypeError(".neutron.RemoteMessage.getFileSystemVersionResponse: object expected");
                message.getFileSystemVersionResponse = $root.neutron.GetFileSystemVersionResponse.fromObject(object.getFileSystemVersionResponse);
            }
            if (object.getThumbnailRequest != null) {
                if (typeof object.getThumbnailRequest !== "object")
                    throw TypeError(".neutron.RemoteMessage.getThumbnailRequest: object expected");
                message.getThumbnailRequest = $root.neutron.GetThumbnailRequest.fromObject(object.getThumbnailRequest);
            }
            if (object.getThumbnailResponse != null) {
                if (typeof object.getThumbnailResponse !== "object")
                    throw TypeError(".neutron.RemoteMessage.getThumbnailResponse: object expected");
                message.getThumbnailResponse = $root.neutron.GetThumbnailResponse.fromObject(object.getThumbnailResponse);
            }
            if (object.playVideoRequest != null) {
                if (typeof object.playVideoRequest !== "object")
                    throw TypeError(".neutron.RemoteMessage.playVideoRequest: object expected");
                message.playVideoRequest = $root.neutron.PlayVideoRequest.fromObject(object.playVideoRequest);
            }
            if (object.playVideoResponse != null) {
                if (typeof object.playVideoResponse !== "object")
                    throw TypeError(".neutron.RemoteMessage.playVideoResponse: object expected");
                message.playVideoResponse = $root.neutron.PlayVideoResponse.fromObject(object.playVideoResponse);
            }
            if (object.webrtcOfferContent != null) {
                if (typeof object.webrtcOfferContent !== "object")
                    throw TypeError(".neutron.RemoteMessage.webrtcOfferContent: object expected");
                message.webrtcOfferContent = $root.neutron.WebRTCOfferContent.fromObject(object.webrtcOfferContent);
            }
            if (object.webrtcAnswerContent != null) {
                if (typeof object.webrtcAnswerContent !== "object")
                    throw TypeError(".neutron.RemoteMessage.webrtcAnswerContent: object expected");
                message.webrtcAnswerContent = $root.neutron.WebRTCAnswerContent.fromObject(object.webrtcAnswerContent);
            }
            if (object.webrtcAnswerCandidatesContent != null) {
                if (typeof object.webrtcAnswerCandidatesContent !== "object")
                    throw TypeError(".neutron.RemoteMessage.webrtcAnswerCandidatesContent: object expected");
                message.webrtcAnswerCandidatesContent = $root.neutron.WebRTCAnswerCandidatesContent.fromObject(object.webrtcAnswerCandidatesContent);
            }
            if (object.webrtcCandidateContent != null) {
                if (typeof object.webrtcCandidateContent !== "object")
                    throw TypeError(".neutron.RemoteMessage.webrtcCandidateContent: object expected");
                message.webrtcCandidateContent = $root.neutron.WebRTCCandidateContent.fromObject(object.webrtcCandidateContent);
            }
            return message;
        };

        /**
         * Creates a plain object from a RemoteMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.RemoteMessage
         * @static
         * @param {neutron.RemoteMessage} message RemoteMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RemoteMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.type = "";
                object.source = "";
                object.destination = "";
                object.id = "";
            }
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.source != null && message.hasOwnProperty("source"))
                object.source = message.source;
            if (message.destination != null && message.hasOwnProperty("destination"))
                object.destination = message.destination;
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.any != null && message.hasOwnProperty("any")) {
                object.any = $root.google.protobuf.Any.toObject(message.any, options);
                if (options.oneofs)
                    object.payload = "any";
            }
            if (message.rawData != null && message.hasOwnProperty("rawData")) {
                object.rawData = options.bytes === String ? $util.base64.encode(message.rawData, 0, message.rawData.length) : options.bytes === Array ? Array.prototype.slice.call(message.rawData) : message.rawData;
                if (options.oneofs)
                    object.payload = "rawData";
            }
            if (message.error != null && message.hasOwnProperty("error")) {
                object.error = $root.neutron.ErrorMessage.toObject(message.error, options);
                if (options.oneofs)
                    object.payload = "error";
            }
            if (message.loginRequest != null && message.hasOwnProperty("loginRequest")) {
                object.loginRequest = $root.neutron.LoginRequest.toObject(message.loginRequest, options);
                if (options.oneofs)
                    object.payload = "loginRequest";
            }
            if (message.loginResponse != null && message.hasOwnProperty("loginResponse")) {
                object.loginResponse = $root.neutron.LoginResponse.toObject(message.loginResponse, options);
                if (options.oneofs)
                    object.payload = "loginResponse";
            }
            if (message.fileInformation != null && message.hasOwnProperty("fileInformation")) {
                object.fileInformation = $root.neutron.FileInformation.toObject(message.fileInformation, options);
                if (options.oneofs)
                    object.payload = "fileInformation";
            }
            if (message.imageRepoHistoryRequest != null && message.hasOwnProperty("imageRepoHistoryRequest")) {
                object.imageRepoHistoryRequest = $root.neutron.ImageRepoHistoryRequest.toObject(message.imageRepoHistoryRequest, options);
                if (options.oneofs)
                    object.payload = "imageRepoHistoryRequest";
            }
            if (message.imageRepoHistoryItem != null && message.hasOwnProperty("imageRepoHistoryItem")) {
                object.imageRepoHistoryItem = $root.neutron.ImageRepoHistoryItem.toObject(message.imageRepoHistoryItem, options);
                if (options.oneofs)
                    object.payload = "imageRepoHistoryItem";
            }
            if (message.imageRepoHistoryResponse != null && message.hasOwnProperty("imageRepoHistoryResponse")) {
                object.imageRepoHistoryResponse = $root.neutron.ImageRepoHistoryResponse.toObject(message.imageRepoHistoryResponse, options);
                if (options.oneofs)
                    object.payload = "imageRepoHistoryResponse";
            }
            if (message.imageRepoPageRequest != null && message.hasOwnProperty("imageRepoPageRequest")) {
                object.imageRepoPageRequest = $root.neutron.ImageRepoPageRequest.toObject(message.imageRepoPageRequest, options);
                if (options.oneofs)
                    object.payload = "imageRepoPageRequest";
            }
            if (message.imageRepoPageResponse != null && message.hasOwnProperty("imageRepoPageResponse")) {
                object.imageRepoPageResponse = $root.neutron.ImageRepoPageResponse.toObject(message.imageRepoPageResponse, options);
                if (options.oneofs)
                    object.payload = "imageRepoPageResponse";
            }
            if (message.prepareFileReceiveRequest != null && message.hasOwnProperty("prepareFileReceiveRequest")) {
                object.prepareFileReceiveRequest = $root.neutron.PrepareFileReceiveRequest.toObject(message.prepareFileReceiveRequest, options);
                if (options.oneofs)
                    object.payload = "prepareFileReceiveRequest";
            }
            if (message.prepareFileReceiveResponse != null && message.hasOwnProperty("prepareFileReceiveResponse")) {
                object.prepareFileReceiveResponse = $root.neutron.PrepareFileReceiveResponse.toObject(message.prepareFileReceiveResponse, options);
                if (options.oneofs)
                    object.payload = "prepareFileReceiveResponse";
            }
            if (message.getFileInfoRequest != null && message.hasOwnProperty("getFileInfoRequest")) {
                object.getFileInfoRequest = $root.neutron.GetFileInfoRequest.toObject(message.getFileInfoRequest, options);
                if (options.oneofs)
                    object.payload = "getFileInfoRequest";
            }
            if (message.listFilesRequest != null && message.hasOwnProperty("listFilesRequest")) {
                object.listFilesRequest = $root.neutron.ListFilesRequest.toObject(message.listFilesRequest, options);
                if (options.oneofs)
                    object.payload = "listFilesRequest";
            }
            if (message.listFilesResponse != null && message.hasOwnProperty("listFilesResponse")) {
                object.listFilesResponse = $root.neutron.ListFilesResponse.toObject(message.listFilesResponse, options);
                if (options.oneofs)
                    object.payload = "listFilesResponse";
            }
            if (message.getFileSystemVersionRequest != null && message.hasOwnProperty("getFileSystemVersionRequest")) {
                object.getFileSystemVersionRequest = $root.neutron.GetFileSystemVersionRequest.toObject(message.getFileSystemVersionRequest, options);
                if (options.oneofs)
                    object.payload = "getFileSystemVersionRequest";
            }
            if (message.getFileSystemVersionResponse != null && message.hasOwnProperty("getFileSystemVersionResponse")) {
                object.getFileSystemVersionResponse = $root.neutron.GetFileSystemVersionResponse.toObject(message.getFileSystemVersionResponse, options);
                if (options.oneofs)
                    object.payload = "getFileSystemVersionResponse";
            }
            if (message.getThumbnailRequest != null && message.hasOwnProperty("getThumbnailRequest")) {
                object.getThumbnailRequest = $root.neutron.GetThumbnailRequest.toObject(message.getThumbnailRequest, options);
                if (options.oneofs)
                    object.payload = "getThumbnailRequest";
            }
            if (message.getThumbnailResponse != null && message.hasOwnProperty("getThumbnailResponse")) {
                object.getThumbnailResponse = $root.neutron.GetThumbnailResponse.toObject(message.getThumbnailResponse, options);
                if (options.oneofs)
                    object.payload = "getThumbnailResponse";
            }
            if (message.playVideoRequest != null && message.hasOwnProperty("playVideoRequest")) {
                object.playVideoRequest = $root.neutron.PlayVideoRequest.toObject(message.playVideoRequest, options);
                if (options.oneofs)
                    object.payload = "playVideoRequest";
            }
            if (message.playVideoResponse != null && message.hasOwnProperty("playVideoResponse")) {
                object.playVideoResponse = $root.neutron.PlayVideoResponse.toObject(message.playVideoResponse, options);
                if (options.oneofs)
                    object.payload = "playVideoResponse";
            }
            if (message.webrtcOfferContent != null && message.hasOwnProperty("webrtcOfferContent")) {
                object.webrtcOfferContent = $root.neutron.WebRTCOfferContent.toObject(message.webrtcOfferContent, options);
                if (options.oneofs)
                    object.payload = "webrtcOfferContent";
            }
            if (message.webrtcAnswerContent != null && message.hasOwnProperty("webrtcAnswerContent")) {
                object.webrtcAnswerContent = $root.neutron.WebRTCAnswerContent.toObject(message.webrtcAnswerContent, options);
                if (options.oneofs)
                    object.payload = "webrtcAnswerContent";
            }
            if (message.webrtcAnswerCandidatesContent != null && message.hasOwnProperty("webrtcAnswerCandidatesContent")) {
                object.webrtcAnswerCandidatesContent = $root.neutron.WebRTCAnswerCandidatesContent.toObject(message.webrtcAnswerCandidatesContent, options);
                if (options.oneofs)
                    object.payload = "webrtcAnswerCandidatesContent";
            }
            if (message.webrtcCandidateContent != null && message.hasOwnProperty("webrtcCandidateContent")) {
                object.webrtcCandidateContent = $root.neutron.WebRTCCandidateContent.toObject(message.webrtcCandidateContent, options);
                if (options.oneofs)
                    object.payload = "webrtcCandidateContent";
            }
            return object;
        };

        /**
         * Converts this RemoteMessage to JSON.
         * @function toJSON
         * @memberof neutron.RemoteMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RemoteMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for RemoteMessage
         * @function getTypeUrl
         * @memberof neutron.RemoteMessage
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        RemoteMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.RemoteMessage";
        };

        return RemoteMessage;
    })();

    neutron.WebRTCOfferContent = (function() {

        /**
         * Properties of a WebRTCOfferContent.
         * @memberof neutron
         * @interface IWebRTCOfferContent
         * @property {string|null} [sdp] WebRTCOfferContent sdp
         */

        /**
         * Constructs a new WebRTCOfferContent.
         * @memberof neutron
         * @classdesc Represents a WebRTCOfferContent.
         * @implements IWebRTCOfferContent
         * @constructor
         * @param {neutron.IWebRTCOfferContent=} [properties] Properties to set
         */
        function WebRTCOfferContent(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WebRTCOfferContent sdp.
         * @member {string} sdp
         * @memberof neutron.WebRTCOfferContent
         * @instance
         */
        WebRTCOfferContent.prototype.sdp = "";

        /**
         * Creates a new WebRTCOfferContent instance using the specified properties.
         * @function create
         * @memberof neutron.WebRTCOfferContent
         * @static
         * @param {neutron.IWebRTCOfferContent=} [properties] Properties to set
         * @returns {neutron.WebRTCOfferContent} WebRTCOfferContent instance
         */
        WebRTCOfferContent.create = function create(properties) {
            return new WebRTCOfferContent(properties);
        };

        /**
         * Encodes the specified WebRTCOfferContent message. Does not implicitly {@link neutron.WebRTCOfferContent.verify|verify} messages.
         * @function encode
         * @memberof neutron.WebRTCOfferContent
         * @static
         * @param {neutron.IWebRTCOfferContent} message WebRTCOfferContent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WebRTCOfferContent.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sdp != null && Object.hasOwnProperty.call(message, "sdp"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.sdp);
            return writer;
        };

        /**
         * Encodes the specified WebRTCOfferContent message, length delimited. Does not implicitly {@link neutron.WebRTCOfferContent.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.WebRTCOfferContent
         * @static
         * @param {neutron.IWebRTCOfferContent} message WebRTCOfferContent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WebRTCOfferContent.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WebRTCOfferContent message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.WebRTCOfferContent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.WebRTCOfferContent} WebRTCOfferContent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WebRTCOfferContent.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.WebRTCOfferContent();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.sdp = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a WebRTCOfferContent message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.WebRTCOfferContent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.WebRTCOfferContent} WebRTCOfferContent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WebRTCOfferContent.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WebRTCOfferContent message.
         * @function verify
         * @memberof neutron.WebRTCOfferContent
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WebRTCOfferContent.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sdp != null && message.hasOwnProperty("sdp"))
                if (!$util.isString(message.sdp))
                    return "sdp: string expected";
            return null;
        };

        /**
         * Creates a WebRTCOfferContent message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.WebRTCOfferContent
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.WebRTCOfferContent} WebRTCOfferContent
         */
        WebRTCOfferContent.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.WebRTCOfferContent)
                return object;
            let message = new $root.neutron.WebRTCOfferContent();
            if (object.sdp != null)
                message.sdp = String(object.sdp);
            return message;
        };

        /**
         * Creates a plain object from a WebRTCOfferContent message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.WebRTCOfferContent
         * @static
         * @param {neutron.WebRTCOfferContent} message WebRTCOfferContent
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WebRTCOfferContent.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.sdp = "";
            if (message.sdp != null && message.hasOwnProperty("sdp"))
                object.sdp = message.sdp;
            return object;
        };

        /**
         * Converts this WebRTCOfferContent to JSON.
         * @function toJSON
         * @memberof neutron.WebRTCOfferContent
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WebRTCOfferContent.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WebRTCOfferContent
         * @function getTypeUrl
         * @memberof neutron.WebRTCOfferContent
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WebRTCOfferContent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.WebRTCOfferContent";
        };

        return WebRTCOfferContent;
    })();

    neutron.WebRTCAnswerContent = (function() {

        /**
         * Properties of a WebRTCAnswerContent.
         * @memberof neutron
         * @interface IWebRTCAnswerContent
         * @property {string|null} [sdp] WebRTCAnswerContent sdp
         */

        /**
         * Constructs a new WebRTCAnswerContent.
         * @memberof neutron
         * @classdesc Represents a WebRTCAnswerContent.
         * @implements IWebRTCAnswerContent
         * @constructor
         * @param {neutron.IWebRTCAnswerContent=} [properties] Properties to set
         */
        function WebRTCAnswerContent(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WebRTCAnswerContent sdp.
         * @member {string} sdp
         * @memberof neutron.WebRTCAnswerContent
         * @instance
         */
        WebRTCAnswerContent.prototype.sdp = "";

        /**
         * Creates a new WebRTCAnswerContent instance using the specified properties.
         * @function create
         * @memberof neutron.WebRTCAnswerContent
         * @static
         * @param {neutron.IWebRTCAnswerContent=} [properties] Properties to set
         * @returns {neutron.WebRTCAnswerContent} WebRTCAnswerContent instance
         */
        WebRTCAnswerContent.create = function create(properties) {
            return new WebRTCAnswerContent(properties);
        };

        /**
         * Encodes the specified WebRTCAnswerContent message. Does not implicitly {@link neutron.WebRTCAnswerContent.verify|verify} messages.
         * @function encode
         * @memberof neutron.WebRTCAnswerContent
         * @static
         * @param {neutron.IWebRTCAnswerContent} message WebRTCAnswerContent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WebRTCAnswerContent.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sdp != null && Object.hasOwnProperty.call(message, "sdp"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.sdp);
            return writer;
        };

        /**
         * Encodes the specified WebRTCAnswerContent message, length delimited. Does not implicitly {@link neutron.WebRTCAnswerContent.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.WebRTCAnswerContent
         * @static
         * @param {neutron.IWebRTCAnswerContent} message WebRTCAnswerContent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WebRTCAnswerContent.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WebRTCAnswerContent message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.WebRTCAnswerContent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.WebRTCAnswerContent} WebRTCAnswerContent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WebRTCAnswerContent.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.WebRTCAnswerContent();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.sdp = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a WebRTCAnswerContent message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.WebRTCAnswerContent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.WebRTCAnswerContent} WebRTCAnswerContent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WebRTCAnswerContent.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WebRTCAnswerContent message.
         * @function verify
         * @memberof neutron.WebRTCAnswerContent
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WebRTCAnswerContent.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sdp != null && message.hasOwnProperty("sdp"))
                if (!$util.isString(message.sdp))
                    return "sdp: string expected";
            return null;
        };

        /**
         * Creates a WebRTCAnswerContent message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.WebRTCAnswerContent
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.WebRTCAnswerContent} WebRTCAnswerContent
         */
        WebRTCAnswerContent.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.WebRTCAnswerContent)
                return object;
            let message = new $root.neutron.WebRTCAnswerContent();
            if (object.sdp != null)
                message.sdp = String(object.sdp);
            return message;
        };

        /**
         * Creates a plain object from a WebRTCAnswerContent message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.WebRTCAnswerContent
         * @static
         * @param {neutron.WebRTCAnswerContent} message WebRTCAnswerContent
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WebRTCAnswerContent.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.sdp = "";
            if (message.sdp != null && message.hasOwnProperty("sdp"))
                object.sdp = message.sdp;
            return object;
        };

        /**
         * Converts this WebRTCAnswerContent to JSON.
         * @function toJSON
         * @memberof neutron.WebRTCAnswerContent
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WebRTCAnswerContent.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WebRTCAnswerContent
         * @function getTypeUrl
         * @memberof neutron.WebRTCAnswerContent
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WebRTCAnswerContent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.WebRTCAnswerContent";
        };

        return WebRTCAnswerContent;
    })();

    neutron.WebRTCAnswerCandidatesContent = (function() {

        /**
         * Properties of a WebRTCAnswerCandidatesContent.
         * @memberof neutron
         * @interface IWebRTCAnswerCandidatesContent
         * @property {string|null} [sdp] WebRTCAnswerCandidatesContent sdp
         * @property {string|null} [type] WebRTCAnswerCandidatesContent type
         */

        /**
         * Constructs a new WebRTCAnswerCandidatesContent.
         * @memberof neutron
         * @classdesc Represents a WebRTCAnswerCandidatesContent.
         * @implements IWebRTCAnswerCandidatesContent
         * @constructor
         * @param {neutron.IWebRTCAnswerCandidatesContent=} [properties] Properties to set
         */
        function WebRTCAnswerCandidatesContent(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WebRTCAnswerCandidatesContent sdp.
         * @member {string} sdp
         * @memberof neutron.WebRTCAnswerCandidatesContent
         * @instance
         */
        WebRTCAnswerCandidatesContent.prototype.sdp = "";

        /**
         * WebRTCAnswerCandidatesContent type.
         * @member {string} type
         * @memberof neutron.WebRTCAnswerCandidatesContent
         * @instance
         */
        WebRTCAnswerCandidatesContent.prototype.type = "";

        /**
         * Creates a new WebRTCAnswerCandidatesContent instance using the specified properties.
         * @function create
         * @memberof neutron.WebRTCAnswerCandidatesContent
         * @static
         * @param {neutron.IWebRTCAnswerCandidatesContent=} [properties] Properties to set
         * @returns {neutron.WebRTCAnswerCandidatesContent} WebRTCAnswerCandidatesContent instance
         */
        WebRTCAnswerCandidatesContent.create = function create(properties) {
            return new WebRTCAnswerCandidatesContent(properties);
        };

        /**
         * Encodes the specified WebRTCAnswerCandidatesContent message. Does not implicitly {@link neutron.WebRTCAnswerCandidatesContent.verify|verify} messages.
         * @function encode
         * @memberof neutron.WebRTCAnswerCandidatesContent
         * @static
         * @param {neutron.IWebRTCAnswerCandidatesContent} message WebRTCAnswerCandidatesContent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WebRTCAnswerCandidatesContent.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sdp != null && Object.hasOwnProperty.call(message, "sdp"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.sdp);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.type);
            return writer;
        };

        /**
         * Encodes the specified WebRTCAnswerCandidatesContent message, length delimited. Does not implicitly {@link neutron.WebRTCAnswerCandidatesContent.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.WebRTCAnswerCandidatesContent
         * @static
         * @param {neutron.IWebRTCAnswerCandidatesContent} message WebRTCAnswerCandidatesContent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WebRTCAnswerCandidatesContent.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WebRTCAnswerCandidatesContent message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.WebRTCAnswerCandidatesContent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.WebRTCAnswerCandidatesContent} WebRTCAnswerCandidatesContent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WebRTCAnswerCandidatesContent.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.WebRTCAnswerCandidatesContent();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.sdp = reader.string();
                        break;
                    }
                case 2: {
                        message.type = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a WebRTCAnswerCandidatesContent message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.WebRTCAnswerCandidatesContent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.WebRTCAnswerCandidatesContent} WebRTCAnswerCandidatesContent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WebRTCAnswerCandidatesContent.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WebRTCAnswerCandidatesContent message.
         * @function verify
         * @memberof neutron.WebRTCAnswerCandidatesContent
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WebRTCAnswerCandidatesContent.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sdp != null && message.hasOwnProperty("sdp"))
                if (!$util.isString(message.sdp))
                    return "sdp: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            return null;
        };

        /**
         * Creates a WebRTCAnswerCandidatesContent message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.WebRTCAnswerCandidatesContent
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.WebRTCAnswerCandidatesContent} WebRTCAnswerCandidatesContent
         */
        WebRTCAnswerCandidatesContent.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.WebRTCAnswerCandidatesContent)
                return object;
            let message = new $root.neutron.WebRTCAnswerCandidatesContent();
            if (object.sdp != null)
                message.sdp = String(object.sdp);
            if (object.type != null)
                message.type = String(object.type);
            return message;
        };

        /**
         * Creates a plain object from a WebRTCAnswerCandidatesContent message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.WebRTCAnswerCandidatesContent
         * @static
         * @param {neutron.WebRTCAnswerCandidatesContent} message WebRTCAnswerCandidatesContent
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WebRTCAnswerCandidatesContent.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.sdp = "";
                object.type = "";
            }
            if (message.sdp != null && message.hasOwnProperty("sdp"))
                object.sdp = message.sdp;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            return object;
        };

        /**
         * Converts this WebRTCAnswerCandidatesContent to JSON.
         * @function toJSON
         * @memberof neutron.WebRTCAnswerCandidatesContent
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WebRTCAnswerCandidatesContent.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WebRTCAnswerCandidatesContent
         * @function getTypeUrl
         * @memberof neutron.WebRTCAnswerCandidatesContent
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WebRTCAnswerCandidatesContent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.WebRTCAnswerCandidatesContent";
        };

        return WebRTCAnswerCandidatesContent;
    })();

    neutron.WebRTCCandidateContent = (function() {

        /**
         * Properties of a WebRTCCandidateContent.
         * @memberof neutron
         * @interface IWebRTCCandidateContent
         * @property {string|null} [candidate] WebRTCCandidateContent candidate
         */

        /**
         * Constructs a new WebRTCCandidateContent.
         * @memberof neutron
         * @classdesc Represents a WebRTCCandidateContent.
         * @implements IWebRTCCandidateContent
         * @constructor
         * @param {neutron.IWebRTCCandidateContent=} [properties] Properties to set
         */
        function WebRTCCandidateContent(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WebRTCCandidateContent candidate.
         * @member {string} candidate
         * @memberof neutron.WebRTCCandidateContent
         * @instance
         */
        WebRTCCandidateContent.prototype.candidate = "";

        /**
         * Creates a new WebRTCCandidateContent instance using the specified properties.
         * @function create
         * @memberof neutron.WebRTCCandidateContent
         * @static
         * @param {neutron.IWebRTCCandidateContent=} [properties] Properties to set
         * @returns {neutron.WebRTCCandidateContent} WebRTCCandidateContent instance
         */
        WebRTCCandidateContent.create = function create(properties) {
            return new WebRTCCandidateContent(properties);
        };

        /**
         * Encodes the specified WebRTCCandidateContent message. Does not implicitly {@link neutron.WebRTCCandidateContent.verify|verify} messages.
         * @function encode
         * @memberof neutron.WebRTCCandidateContent
         * @static
         * @param {neutron.IWebRTCCandidateContent} message WebRTCCandidateContent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WebRTCCandidateContent.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.candidate != null && Object.hasOwnProperty.call(message, "candidate"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.candidate);
            return writer;
        };

        /**
         * Encodes the specified WebRTCCandidateContent message, length delimited. Does not implicitly {@link neutron.WebRTCCandidateContent.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.WebRTCCandidateContent
         * @static
         * @param {neutron.IWebRTCCandidateContent} message WebRTCCandidateContent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WebRTCCandidateContent.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WebRTCCandidateContent message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.WebRTCCandidateContent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.WebRTCCandidateContent} WebRTCCandidateContent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WebRTCCandidateContent.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.WebRTCCandidateContent();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.candidate = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a WebRTCCandidateContent message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.WebRTCCandidateContent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.WebRTCCandidateContent} WebRTCCandidateContent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WebRTCCandidateContent.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WebRTCCandidateContent message.
         * @function verify
         * @memberof neutron.WebRTCCandidateContent
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WebRTCCandidateContent.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.candidate != null && message.hasOwnProperty("candidate"))
                if (!$util.isString(message.candidate))
                    return "candidate: string expected";
            return null;
        };

        /**
         * Creates a WebRTCCandidateContent message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.WebRTCCandidateContent
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.WebRTCCandidateContent} WebRTCCandidateContent
         */
        WebRTCCandidateContent.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.WebRTCCandidateContent)
                return object;
            let message = new $root.neutron.WebRTCCandidateContent();
            if (object.candidate != null)
                message.candidate = String(object.candidate);
            return message;
        };

        /**
         * Creates a plain object from a WebRTCCandidateContent message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.WebRTCCandidateContent
         * @static
         * @param {neutron.WebRTCCandidateContent} message WebRTCCandidateContent
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WebRTCCandidateContent.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.candidate = "";
            if (message.candidate != null && message.hasOwnProperty("candidate"))
                object.candidate = message.candidate;
            return object;
        };

        /**
         * Converts this WebRTCCandidateContent to JSON.
         * @function toJSON
         * @memberof neutron.WebRTCCandidateContent
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WebRTCCandidateContent.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WebRTCCandidateContent
         * @function getTypeUrl
         * @memberof neutron.WebRTCCandidateContent
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WebRTCCandidateContent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.WebRTCCandidateContent";
        };

        return WebRTCCandidateContent;
    })();

    neutron.LoginRequest = (function() {

        /**
         * Properties of a LoginRequest.
         * @memberof neutron
         * @interface ILoginRequest
         * @property {string|null} [clientId] LoginRequest clientId
         * @property {string|null} [username] LoginRequest username
         * @property {string|null} [password] LoginRequest password
         * @property {string|null} [storageServerId] LoginRequest storageServerId
         */

        /**
         * Constructs a new LoginRequest.
         * @memberof neutron
         * @classdesc Represents a LoginRequest.
         * @implements ILoginRequest
         * @constructor
         * @param {neutron.ILoginRequest=} [properties] Properties to set
         */
        function LoginRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LoginRequest clientId.
         * @member {string} clientId
         * @memberof neutron.LoginRequest
         * @instance
         */
        LoginRequest.prototype.clientId = "";

        /**
         * LoginRequest username.
         * @member {string} username
         * @memberof neutron.LoginRequest
         * @instance
         */
        LoginRequest.prototype.username = "";

        /**
         * LoginRequest password.
         * @member {string} password
         * @memberof neutron.LoginRequest
         * @instance
         */
        LoginRequest.prototype.password = "";

        /**
         * LoginRequest storageServerId.
         * @member {string} storageServerId
         * @memberof neutron.LoginRequest
         * @instance
         */
        LoginRequest.prototype.storageServerId = "";

        /**
         * Creates a new LoginRequest instance using the specified properties.
         * @function create
         * @memberof neutron.LoginRequest
         * @static
         * @param {neutron.ILoginRequest=} [properties] Properties to set
         * @returns {neutron.LoginRequest} LoginRequest instance
         */
        LoginRequest.create = function create(properties) {
            return new LoginRequest(properties);
        };

        /**
         * Encodes the specified LoginRequest message. Does not implicitly {@link neutron.LoginRequest.verify|verify} messages.
         * @function encode
         * @memberof neutron.LoginRequest
         * @static
         * @param {neutron.ILoginRequest} message LoginRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.clientId != null && Object.hasOwnProperty.call(message, "clientId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.clientId);
            if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
            if (message.password != null && Object.hasOwnProperty.call(message, "password"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.password);
            if (message.storageServerId != null && Object.hasOwnProperty.call(message, "storageServerId"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.storageServerId);
            return writer;
        };

        /**
         * Encodes the specified LoginRequest message, length delimited. Does not implicitly {@link neutron.LoginRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.LoginRequest
         * @static
         * @param {neutron.ILoginRequest} message LoginRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LoginRequest message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.LoginRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.LoginRequest} LoginRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.LoginRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.clientId = reader.string();
                        break;
                    }
                case 2: {
                        message.username = reader.string();
                        break;
                    }
                case 3: {
                        message.password = reader.string();
                        break;
                    }
                case 4: {
                        message.storageServerId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LoginRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.LoginRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.LoginRequest} LoginRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LoginRequest message.
         * @function verify
         * @memberof neutron.LoginRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LoginRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.clientId != null && message.hasOwnProperty("clientId"))
                if (!$util.isString(message.clientId))
                    return "clientId: string expected";
            if (message.username != null && message.hasOwnProperty("username"))
                if (!$util.isString(message.username))
                    return "username: string expected";
            if (message.password != null && message.hasOwnProperty("password"))
                if (!$util.isString(message.password))
                    return "password: string expected";
            if (message.storageServerId != null && message.hasOwnProperty("storageServerId"))
                if (!$util.isString(message.storageServerId))
                    return "storageServerId: string expected";
            return null;
        };

        /**
         * Creates a LoginRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.LoginRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.LoginRequest} LoginRequest
         */
        LoginRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.LoginRequest)
                return object;
            let message = new $root.neutron.LoginRequest();
            if (object.clientId != null)
                message.clientId = String(object.clientId);
            if (object.username != null)
                message.username = String(object.username);
            if (object.password != null)
                message.password = String(object.password);
            if (object.storageServerId != null)
                message.storageServerId = String(object.storageServerId);
            return message;
        };

        /**
         * Creates a plain object from a LoginRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.LoginRequest
         * @static
         * @param {neutron.LoginRequest} message LoginRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LoginRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.clientId = "";
                object.username = "";
                object.password = "";
                object.storageServerId = "";
            }
            if (message.clientId != null && message.hasOwnProperty("clientId"))
                object.clientId = message.clientId;
            if (message.username != null && message.hasOwnProperty("username"))
                object.username = message.username;
            if (message.password != null && message.hasOwnProperty("password"))
                object.password = message.password;
            if (message.storageServerId != null && message.hasOwnProperty("storageServerId"))
                object.storageServerId = message.storageServerId;
            return object;
        };

        /**
         * Converts this LoginRequest to JSON.
         * @function toJSON
         * @memberof neutron.LoginRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LoginRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LoginRequest
         * @function getTypeUrl
         * @memberof neutron.LoginRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LoginRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.LoginRequest";
        };

        return LoginRequest;
    })();

    neutron.LoginResponse = (function() {

        /**
         * Properties of a LoginResponse.
         * @memberof neutron
         * @interface ILoginResponse
         * @property {string|null} [token] LoginResponse token
         */

        /**
         * Constructs a new LoginResponse.
         * @memberof neutron
         * @classdesc Represents a LoginResponse.
         * @implements ILoginResponse
         * @constructor
         * @param {neutron.ILoginResponse=} [properties] Properties to set
         */
        function LoginResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LoginResponse token.
         * @member {string} token
         * @memberof neutron.LoginResponse
         * @instance
         */
        LoginResponse.prototype.token = "";

        /**
         * Creates a new LoginResponse instance using the specified properties.
         * @function create
         * @memberof neutron.LoginResponse
         * @static
         * @param {neutron.ILoginResponse=} [properties] Properties to set
         * @returns {neutron.LoginResponse} LoginResponse instance
         */
        LoginResponse.create = function create(properties) {
            return new LoginResponse(properties);
        };

        /**
         * Encodes the specified LoginResponse message. Does not implicitly {@link neutron.LoginResponse.verify|verify} messages.
         * @function encode
         * @memberof neutron.LoginResponse
         * @static
         * @param {neutron.ILoginResponse} message LoginResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.token != null && Object.hasOwnProperty.call(message, "token"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.token);
            return writer;
        };

        /**
         * Encodes the specified LoginResponse message, length delimited. Does not implicitly {@link neutron.LoginResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.LoginResponse
         * @static
         * @param {neutron.ILoginResponse} message LoginResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LoginResponse message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.LoginResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.LoginResponse} LoginResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.LoginResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.token = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LoginResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.LoginResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.LoginResponse} LoginResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LoginResponse message.
         * @function verify
         * @memberof neutron.LoginResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LoginResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.token != null && message.hasOwnProperty("token"))
                if (!$util.isString(message.token))
                    return "token: string expected";
            return null;
        };

        /**
         * Creates a LoginResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.LoginResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.LoginResponse} LoginResponse
         */
        LoginResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.LoginResponse)
                return object;
            let message = new $root.neutron.LoginResponse();
            if (object.token != null)
                message.token = String(object.token);
            return message;
        };

        /**
         * Creates a plain object from a LoginResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.LoginResponse
         * @static
         * @param {neutron.LoginResponse} message LoginResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LoginResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.token = "";
            if (message.token != null && message.hasOwnProperty("token"))
                object.token = message.token;
            return object;
        };

        /**
         * Converts this LoginResponse to JSON.
         * @function toJSON
         * @memberof neutron.LoginResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LoginResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LoginResponse
         * @function getTypeUrl
         * @memberof neutron.LoginResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LoginResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.LoginResponse";
        };

        return LoginResponse;
    })();

    return neutron;
})();

export const google = $root.google = (() => {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    const google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        const protobuf = {};

        protobuf.Struct = (function() {

            /**
             * Properties of a Struct.
             * @memberof google.protobuf
             * @interface IStruct
             * @property {Object.<string,google.protobuf.IValue>|null} [fields] Struct fields
             */

            /**
             * Constructs a new Struct.
             * @memberof google.protobuf
             * @classdesc Represents a Struct.
             * @implements IStruct
             * @constructor
             * @param {google.protobuf.IStruct=} [properties] Properties to set
             */
            function Struct(properties) {
                this.fields = {};
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Struct fields.
             * @member {Object.<string,google.protobuf.IValue>} fields
             * @memberof google.protobuf.Struct
             * @instance
             */
            Struct.prototype.fields = $util.emptyObject;

            /**
             * Creates a new Struct instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Struct
             * @static
             * @param {google.protobuf.IStruct=} [properties] Properties to set
             * @returns {google.protobuf.Struct} Struct instance
             */
            Struct.create = function create(properties) {
                return new Struct(properties);
            };

            /**
             * Encodes the specified Struct message. Does not implicitly {@link google.protobuf.Struct.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Struct
             * @static
             * @param {google.protobuf.IStruct} message Struct message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Struct.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.fields != null && Object.hasOwnProperty.call(message, "fields"))
                    for (let keys = Object.keys(message.fields), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.google.protobuf.Value.encode(message.fields[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                return writer;
            };

            /**
             * Encodes the specified Struct message, length delimited. Does not implicitly {@link google.protobuf.Struct.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Struct
             * @static
             * @param {google.protobuf.IStruct} message Struct message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Struct.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Struct message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Struct
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Struct} Struct
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Struct.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Struct(), key, value;
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (message.fields === $util.emptyObject)
                                message.fields = {};
                            let end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                let tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = $root.google.protobuf.Value.decode(reader, reader.uint32());
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.fields[key] = value;
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Struct message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Struct
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Struct} Struct
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Struct.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Struct message.
             * @function verify
             * @memberof google.protobuf.Struct
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Struct.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.fields != null && message.hasOwnProperty("fields")) {
                    if (!$util.isObject(message.fields))
                        return "fields: object expected";
                    let key = Object.keys(message.fields);
                    for (let i = 0; i < key.length; ++i) {
                        let error = $root.google.protobuf.Value.verify(message.fields[key[i]]);
                        if (error)
                            return "fields." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Struct message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Struct
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Struct} Struct
             */
            Struct.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Struct)
                    return object;
                let message = new $root.google.protobuf.Struct();
                if (object.fields) {
                    if (typeof object.fields !== "object")
                        throw TypeError(".google.protobuf.Struct.fields: object expected");
                    message.fields = {};
                    for (let keys = Object.keys(object.fields), i = 0; i < keys.length; ++i) {
                        if (typeof object.fields[keys[i]] !== "object")
                            throw TypeError(".google.protobuf.Struct.fields: object expected");
                        message.fields[keys[i]] = $root.google.protobuf.Value.fromObject(object.fields[keys[i]]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Struct message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Struct
             * @static
             * @param {google.protobuf.Struct} message Struct
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Struct.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.objects || options.defaults)
                    object.fields = {};
                let keys2;
                if (message.fields && (keys2 = Object.keys(message.fields)).length) {
                    object.fields = {};
                    for (let j = 0; j < keys2.length; ++j)
                        object.fields[keys2[j]] = $root.google.protobuf.Value.toObject(message.fields[keys2[j]], options);
                }
                return object;
            };

            /**
             * Converts this Struct to JSON.
             * @function toJSON
             * @memberof google.protobuf.Struct
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Struct.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Struct
             * @function getTypeUrl
             * @memberof google.protobuf.Struct
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Struct.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Struct";
            };

            return Struct;
        })();

        protobuf.Value = (function() {

            /**
             * Properties of a Value.
             * @memberof google.protobuf
             * @interface IValue
             * @property {google.protobuf.NullValue|null} [nullValue] Value nullValue
             * @property {number|null} [numberValue] Value numberValue
             * @property {string|null} [stringValue] Value stringValue
             * @property {boolean|null} [boolValue] Value boolValue
             * @property {google.protobuf.IStruct|null} [structValue] Value structValue
             * @property {google.protobuf.IListValue|null} [listValue] Value listValue
             */

            /**
             * Constructs a new Value.
             * @memberof google.protobuf
             * @classdesc Represents a Value.
             * @implements IValue
             * @constructor
             * @param {google.protobuf.IValue=} [properties] Properties to set
             */
            function Value(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Value nullValue.
             * @member {google.protobuf.NullValue|null|undefined} nullValue
             * @memberof google.protobuf.Value
             * @instance
             */
            Value.prototype.nullValue = null;

            /**
             * Value numberValue.
             * @member {number|null|undefined} numberValue
             * @memberof google.protobuf.Value
             * @instance
             */
            Value.prototype.numberValue = null;

            /**
             * Value stringValue.
             * @member {string|null|undefined} stringValue
             * @memberof google.protobuf.Value
             * @instance
             */
            Value.prototype.stringValue = null;

            /**
             * Value boolValue.
             * @member {boolean|null|undefined} boolValue
             * @memberof google.protobuf.Value
             * @instance
             */
            Value.prototype.boolValue = null;

            /**
             * Value structValue.
             * @member {google.protobuf.IStruct|null|undefined} structValue
             * @memberof google.protobuf.Value
             * @instance
             */
            Value.prototype.structValue = null;

            /**
             * Value listValue.
             * @member {google.protobuf.IListValue|null|undefined} listValue
             * @memberof google.protobuf.Value
             * @instance
             */
            Value.prototype.listValue = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * Value kind.
             * @member {"nullValue"|"numberValue"|"stringValue"|"boolValue"|"structValue"|"listValue"|undefined} kind
             * @memberof google.protobuf.Value
             * @instance
             */
            Object.defineProperty(Value.prototype, "kind", {
                get: $util.oneOfGetter($oneOfFields = ["nullValue", "numberValue", "stringValue", "boolValue", "structValue", "listValue"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Value instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Value
             * @static
             * @param {google.protobuf.IValue=} [properties] Properties to set
             * @returns {google.protobuf.Value} Value instance
             */
            Value.create = function create(properties) {
                return new Value(properties);
            };

            /**
             * Encodes the specified Value message. Does not implicitly {@link google.protobuf.Value.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Value
             * @static
             * @param {google.protobuf.IValue} message Value message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Value.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.nullValue != null && Object.hasOwnProperty.call(message, "nullValue"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.nullValue);
                if (message.numberValue != null && Object.hasOwnProperty.call(message, "numberValue"))
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.numberValue);
                if (message.stringValue != null && Object.hasOwnProperty.call(message, "stringValue"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.stringValue);
                if (message.boolValue != null && Object.hasOwnProperty.call(message, "boolValue"))
                    writer.uint32(/* id 4, wireType 0 =*/32).bool(message.boolValue);
                if (message.structValue != null && Object.hasOwnProperty.call(message, "structValue"))
                    $root.google.protobuf.Struct.encode(message.structValue, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.listValue != null && Object.hasOwnProperty.call(message, "listValue"))
                    $root.google.protobuf.ListValue.encode(message.listValue, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Value message, length delimited. Does not implicitly {@link google.protobuf.Value.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Value
             * @static
             * @param {google.protobuf.IValue} message Value message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Value.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Value message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Value} Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Value.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Value();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.nullValue = reader.int32();
                            break;
                        }
                    case 2: {
                            message.numberValue = reader.double();
                            break;
                        }
                    case 3: {
                            message.stringValue = reader.string();
                            break;
                        }
                    case 4: {
                            message.boolValue = reader.bool();
                            break;
                        }
                    case 5: {
                            message.structValue = $root.google.protobuf.Struct.decode(reader, reader.uint32());
                            break;
                        }
                    case 6: {
                            message.listValue = $root.google.protobuf.ListValue.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Value message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Value} Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Value.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Value message.
             * @function verify
             * @memberof google.protobuf.Value
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Value.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                let properties = {};
                if (message.nullValue != null && message.hasOwnProperty("nullValue")) {
                    properties.kind = 1;
                    switch (message.nullValue) {
                    default:
                        return "nullValue: enum value expected";
                    case 0:
                        break;
                    }
                }
                if (message.numberValue != null && message.hasOwnProperty("numberValue")) {
                    if (properties.kind === 1)
                        return "kind: multiple values";
                    properties.kind = 1;
                    if (typeof message.numberValue !== "number")
                        return "numberValue: number expected";
                }
                if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                    if (properties.kind === 1)
                        return "kind: multiple values";
                    properties.kind = 1;
                    if (!$util.isString(message.stringValue))
                        return "stringValue: string expected";
                }
                if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                    if (properties.kind === 1)
                        return "kind: multiple values";
                    properties.kind = 1;
                    if (typeof message.boolValue !== "boolean")
                        return "boolValue: boolean expected";
                }
                if (message.structValue != null && message.hasOwnProperty("structValue")) {
                    if (properties.kind === 1)
                        return "kind: multiple values";
                    properties.kind = 1;
                    {
                        let error = $root.google.protobuf.Struct.verify(message.structValue);
                        if (error)
                            return "structValue." + error;
                    }
                }
                if (message.listValue != null && message.hasOwnProperty("listValue")) {
                    if (properties.kind === 1)
                        return "kind: multiple values";
                    properties.kind = 1;
                    {
                        let error = $root.google.protobuf.ListValue.verify(message.listValue);
                        if (error)
                            return "listValue." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Value message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Value
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Value} Value
             */
            Value.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Value)
                    return object;
                let message = new $root.google.protobuf.Value();
                switch (object.nullValue) {
                default:
                    if (typeof object.nullValue === "number") {
                        message.nullValue = object.nullValue;
                        break;
                    }
                    break;
                case "NULL_VALUE":
                case 0:
                    message.nullValue = 0;
                    break;
                }
                if (object.numberValue != null)
                    message.numberValue = Number(object.numberValue);
                if (object.stringValue != null)
                    message.stringValue = String(object.stringValue);
                if (object.boolValue != null)
                    message.boolValue = Boolean(object.boolValue);
                if (object.structValue != null) {
                    if (typeof object.structValue !== "object")
                        throw TypeError(".google.protobuf.Value.structValue: object expected");
                    message.structValue = $root.google.protobuf.Struct.fromObject(object.structValue);
                }
                if (object.listValue != null) {
                    if (typeof object.listValue !== "object")
                        throw TypeError(".google.protobuf.Value.listValue: object expected");
                    message.listValue = $root.google.protobuf.ListValue.fromObject(object.listValue);
                }
                return message;
            };

            /**
             * Creates a plain object from a Value message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Value
             * @static
             * @param {google.protobuf.Value} message Value
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Value.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (message.nullValue != null && message.hasOwnProperty("nullValue")) {
                    object.nullValue = options.enums === String ? $root.google.protobuf.NullValue[message.nullValue] === undefined ? message.nullValue : $root.google.protobuf.NullValue[message.nullValue] : message.nullValue;
                    if (options.oneofs)
                        object.kind = "nullValue";
                }
                if (message.numberValue != null && message.hasOwnProperty("numberValue")) {
                    object.numberValue = options.json && !isFinite(message.numberValue) ? String(message.numberValue) : message.numberValue;
                    if (options.oneofs)
                        object.kind = "numberValue";
                }
                if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                    object.stringValue = message.stringValue;
                    if (options.oneofs)
                        object.kind = "stringValue";
                }
                if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                    object.boolValue = message.boolValue;
                    if (options.oneofs)
                        object.kind = "boolValue";
                }
                if (message.structValue != null && message.hasOwnProperty("structValue")) {
                    object.structValue = $root.google.protobuf.Struct.toObject(message.structValue, options);
                    if (options.oneofs)
                        object.kind = "structValue";
                }
                if (message.listValue != null && message.hasOwnProperty("listValue")) {
                    object.listValue = $root.google.protobuf.ListValue.toObject(message.listValue, options);
                    if (options.oneofs)
                        object.kind = "listValue";
                }
                return object;
            };

            /**
             * Converts this Value to JSON.
             * @function toJSON
             * @memberof google.protobuf.Value
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Value.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Value
             * @function getTypeUrl
             * @memberof google.protobuf.Value
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Value.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Value";
            };

            return Value;
        })();

        /**
         * NullValue enum.
         * @name google.protobuf.NullValue
         * @enum {number}
         * @property {number} NULL_VALUE=0 NULL_VALUE value
         */
        protobuf.NullValue = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "NULL_VALUE"] = 0;
            return values;
        })();

        protobuf.ListValue = (function() {

            /**
             * Properties of a ListValue.
             * @memberof google.protobuf
             * @interface IListValue
             * @property {Array.<google.protobuf.IValue>|null} [values] ListValue values
             */

            /**
             * Constructs a new ListValue.
             * @memberof google.protobuf
             * @classdesc Represents a ListValue.
             * @implements IListValue
             * @constructor
             * @param {google.protobuf.IListValue=} [properties] Properties to set
             */
            function ListValue(properties) {
                this.values = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ListValue values.
             * @member {Array.<google.protobuf.IValue>} values
             * @memberof google.protobuf.ListValue
             * @instance
             */
            ListValue.prototype.values = $util.emptyArray;

            /**
             * Creates a new ListValue instance using the specified properties.
             * @function create
             * @memberof google.protobuf.ListValue
             * @static
             * @param {google.protobuf.IListValue=} [properties] Properties to set
             * @returns {google.protobuf.ListValue} ListValue instance
             */
            ListValue.create = function create(properties) {
                return new ListValue(properties);
            };

            /**
             * Encodes the specified ListValue message. Does not implicitly {@link google.protobuf.ListValue.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.ListValue
             * @static
             * @param {google.protobuf.IListValue} message ListValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListValue.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.values != null && message.values.length)
                    for (let i = 0; i < message.values.length; ++i)
                        $root.google.protobuf.Value.encode(message.values[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ListValue message, length delimited. Does not implicitly {@link google.protobuf.ListValue.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.ListValue
             * @static
             * @param {google.protobuf.IListValue} message ListValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListValue.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ListValue message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.ListValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.ListValue} ListValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListValue.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.ListValue();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.values && message.values.length))
                                message.values = [];
                            message.values.push($root.google.protobuf.Value.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ListValue message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.ListValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.ListValue} ListValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListValue.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ListValue message.
             * @function verify
             * @memberof google.protobuf.ListValue
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ListValue.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.values != null && message.hasOwnProperty("values")) {
                    if (!Array.isArray(message.values))
                        return "values: array expected";
                    for (let i = 0; i < message.values.length; ++i) {
                        let error = $root.google.protobuf.Value.verify(message.values[i]);
                        if (error)
                            return "values." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ListValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.ListValue
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.ListValue} ListValue
             */
            ListValue.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.ListValue)
                    return object;
                let message = new $root.google.protobuf.ListValue();
                if (object.values) {
                    if (!Array.isArray(object.values))
                        throw TypeError(".google.protobuf.ListValue.values: array expected");
                    message.values = [];
                    for (let i = 0; i < object.values.length; ++i) {
                        if (typeof object.values[i] !== "object")
                            throw TypeError(".google.protobuf.ListValue.values: object expected");
                        message.values[i] = $root.google.protobuf.Value.fromObject(object.values[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a ListValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.ListValue
             * @static
             * @param {google.protobuf.ListValue} message ListValue
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ListValue.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.values = [];
                if (message.values && message.values.length) {
                    object.values = [];
                    for (let j = 0; j < message.values.length; ++j)
                        object.values[j] = $root.google.protobuf.Value.toObject(message.values[j], options);
                }
                return object;
            };

            /**
             * Converts this ListValue to JSON.
             * @function toJSON
             * @memberof google.protobuf.ListValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ListValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ListValue
             * @function getTypeUrl
             * @memberof google.protobuf.ListValue
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ListValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.ListValue";
            };

            return ListValue;
        })();

        protobuf.Any = (function() {

            /**
             * Properties of an Any.
             * @memberof google.protobuf
             * @interface IAny
             * @property {string|null} [type_url] Any type_url
             * @property {Uint8Array|null} [value] Any value
             */

            /**
             * Constructs a new Any.
             * @memberof google.protobuf
             * @classdesc Represents an Any.
             * @implements IAny
             * @constructor
             * @param {google.protobuf.IAny=} [properties] Properties to set
             */
            function Any(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Any type_url.
             * @member {string} type_url
             * @memberof google.protobuf.Any
             * @instance
             */
            Any.prototype.type_url = "";

            /**
             * Any value.
             * @member {Uint8Array} value
             * @memberof google.protobuf.Any
             * @instance
             */
            Any.prototype.value = $util.newBuffer([]);

            /**
             * Creates a new Any instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny=} [properties] Properties to set
             * @returns {google.protobuf.Any} Any instance
             */
            Any.create = function create(properties) {
                return new Any(properties);
            };

            /**
             * Encodes the specified Any message. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny} message Any message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Any.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type_url != null && Object.hasOwnProperty.call(message, "type_url"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.type_url);
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.value);
                return writer;
            };

            /**
             * Encodes the specified Any message, length delimited. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny} message Any message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Any.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Any message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Any
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Any} Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Any.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Any();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.type_url = reader.string();
                            break;
                        }
                    case 2: {
                            message.value = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Any message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Any
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Any} Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Any.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Any message.
             * @function verify
             * @memberof google.protobuf.Any
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Any.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type_url != null && message.hasOwnProperty("type_url"))
                    if (!$util.isString(message.type_url))
                        return "type_url: string expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!(message.value && typeof message.value.length === "number" || $util.isString(message.value)))
                        return "value: buffer expected";
                return null;
            };

            /**
             * Creates an Any message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Any
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Any} Any
             */
            Any.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Any)
                    return object;
                let message = new $root.google.protobuf.Any();
                if (object.type_url != null)
                    message.type_url = String(object.type_url);
                if (object.value != null)
                    if (typeof object.value === "string")
                        $util.base64.decode(object.value, message.value = $util.newBuffer($util.base64.length(object.value)), 0);
                    else if (object.value.length >= 0)
                        message.value = object.value;
                return message;
            };

            /**
             * Creates a plain object from an Any message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.Any} message Any
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Any.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.type_url = "";
                    if (options.bytes === String)
                        object.value = "";
                    else {
                        object.value = [];
                        if (options.bytes !== Array)
                            object.value = $util.newBuffer(object.value);
                    }
                }
                if (message.type_url != null && message.hasOwnProperty("type_url"))
                    object.type_url = message.type_url;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = options.bytes === String ? $util.base64.encode(message.value, 0, message.value.length) : options.bytes === Array ? Array.prototype.slice.call(message.value) : message.value;
                return object;
            };

            /**
             * Converts this Any to JSON.
             * @function toJSON
             * @memberof google.protobuf.Any
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Any.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Any
             * @function getTypeUrl
             * @memberof google.protobuf.Any
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Any.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Any";
            };

            return Any;
        })();

        return protobuf;
    })();

    return google;
})();

export { $root as default };
