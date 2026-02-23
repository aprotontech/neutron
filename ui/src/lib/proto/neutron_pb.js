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
         * @property {number|Long|null} [lastId] ImageRepoHistoryRequest lastId
         * @property {number|null} [count] ImageRepoHistoryRequest count
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
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

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
            if (message.lastId != null && Object.hasOwnProperty.call(message, "lastId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.lastId);
            if (message.count != null && Object.hasOwnProperty.call(message, "count"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.count);
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.version);
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
                        message.lastId = reader.int64();
                        break;
                    }
                case 2: {
                        message.count = reader.int32();
                        break;
                    }
                case 3: {
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
            if (message.lastId != null && message.hasOwnProperty("lastId"))
                if (!$util.isInteger(message.lastId) && !(message.lastId && $util.isInteger(message.lastId.low) && $util.isInteger(message.lastId.high)))
                    return "lastId: integer|Long expected";
            if (message.count != null && message.hasOwnProperty("count"))
                if (!$util.isInteger(message.count))
                    return "count: integer expected";
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
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.lastId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.lastId = options.longs === String ? "0" : 0;
                object.count = 0;
                object.version = "";
            }
            if (message.lastId != null && message.hasOwnProperty("lastId"))
                if (typeof message.lastId === "number")
                    object.lastId = options.longs === String ? String(message.lastId) : message.lastId;
                else
                    object.lastId = options.longs === String ? $util.Long.prototype.toString.call(message.lastId) : options.longs === Number ? new $util.LongBits(message.lastId.low >>> 0, message.lastId.high >>> 0).toNumber() : message.lastId;
            if (message.count != null && message.hasOwnProperty("count"))
                object.count = message.count;
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
         * @property {string|null} [filePath] ImageRepoHistoryItem filePath
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
         * ImageRepoHistoryItem filePath.
         * @member {string} filePath
         * @memberof neutron.ImageRepoHistoryItem
         * @instance
         */
        ImageRepoHistoryItem.prototype.filePath = "";

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
            if (message.filePath != null && Object.hasOwnProperty.call(message, "filePath"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.filePath);
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
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.ImageRepoHistoryItem();
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
                case 6: {
                        message.filePath = reader.string();
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
            if (message.filePath != null && message.hasOwnProperty("filePath"))
                if (!$util.isString(message.filePath))
                    return "filePath: string expected";
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
            if (object.filePath != null)
                message.filePath = String(object.filePath);
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
                object.filePath = "";
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
            if (message.filePath != null && message.hasOwnProperty("filePath"))
                object.filePath = message.filePath;
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
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.version);
            if (message.items != null && message.items.length)
                for (let i = 0; i < message.items.length; ++i)
                    $root.neutron.ImageRepoHistoryItem.encode(message.items[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
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
                        message.version = reader.string();
                        break;
                    }
                case 3: {
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
                object.version = "";
            }
            if (message.total != null && message.hasOwnProperty("total"))
                object.total = message.total;
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

    neutron.FileOperationRequest = (function() {

        /**
         * Properties of a FileOperationRequest.
         * @memberof neutron
         * @interface IFileOperationRequest
         * @property {string|null} [operation] FileOperationRequest operation
         * @property {google.protobuf.IStruct|null} [params] FileOperationRequest params
         */

        /**
         * Constructs a new FileOperationRequest.
         * @memberof neutron
         * @classdesc Represents a FileOperationRequest.
         * @implements IFileOperationRequest
         * @constructor
         * @param {neutron.IFileOperationRequest=} [properties] Properties to set
         */
        function FileOperationRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FileOperationRequest operation.
         * @member {string} operation
         * @memberof neutron.FileOperationRequest
         * @instance
         */
        FileOperationRequest.prototype.operation = "";

        /**
         * FileOperationRequest params.
         * @member {google.protobuf.IStruct|null|undefined} params
         * @memberof neutron.FileOperationRequest
         * @instance
         */
        FileOperationRequest.prototype.params = null;

        /**
         * Creates a new FileOperationRequest instance using the specified properties.
         * @function create
         * @memberof neutron.FileOperationRequest
         * @static
         * @param {neutron.IFileOperationRequest=} [properties] Properties to set
         * @returns {neutron.FileOperationRequest} FileOperationRequest instance
         */
        FileOperationRequest.create = function create(properties) {
            return new FileOperationRequest(properties);
        };

        /**
         * Encodes the specified FileOperationRequest message. Does not implicitly {@link neutron.FileOperationRequest.verify|verify} messages.
         * @function encode
         * @memberof neutron.FileOperationRequest
         * @static
         * @param {neutron.IFileOperationRequest} message FileOperationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FileOperationRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.operation != null && Object.hasOwnProperty.call(message, "operation"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.operation);
            if (message.params != null && Object.hasOwnProperty.call(message, "params"))
                $root.google.protobuf.Struct.encode(message.params, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified FileOperationRequest message, length delimited. Does not implicitly {@link neutron.FileOperationRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.FileOperationRequest
         * @static
         * @param {neutron.IFileOperationRequest} message FileOperationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FileOperationRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FileOperationRequest message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.FileOperationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.FileOperationRequest} FileOperationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FileOperationRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.FileOperationRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.operation = reader.string();
                        break;
                    }
                case 2: {
                        message.params = $root.google.protobuf.Struct.decode(reader, reader.uint32());
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
         * Decodes a FileOperationRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.FileOperationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.FileOperationRequest} FileOperationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FileOperationRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FileOperationRequest message.
         * @function verify
         * @memberof neutron.FileOperationRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FileOperationRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.operation != null && message.hasOwnProperty("operation"))
                if (!$util.isString(message.operation))
                    return "operation: string expected";
            if (message.params != null && message.hasOwnProperty("params")) {
                let error = $root.google.protobuf.Struct.verify(message.params);
                if (error)
                    return "params." + error;
            }
            return null;
        };

        /**
         * Creates a FileOperationRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.FileOperationRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.FileOperationRequest} FileOperationRequest
         */
        FileOperationRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.FileOperationRequest)
                return object;
            let message = new $root.neutron.FileOperationRequest();
            if (object.operation != null)
                message.operation = String(object.operation);
            if (object.params != null) {
                if (typeof object.params !== "object")
                    throw TypeError(".neutron.FileOperationRequest.params: object expected");
                message.params = $root.google.protobuf.Struct.fromObject(object.params);
            }
            return message;
        };

        /**
         * Creates a plain object from a FileOperationRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.FileOperationRequest
         * @static
         * @param {neutron.FileOperationRequest} message FileOperationRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FileOperationRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.operation = "";
                object.params = null;
            }
            if (message.operation != null && message.hasOwnProperty("operation"))
                object.operation = message.operation;
            if (message.params != null && message.hasOwnProperty("params"))
                object.params = $root.google.protobuf.Struct.toObject(message.params, options);
            return object;
        };

        /**
         * Converts this FileOperationRequest to JSON.
         * @function toJSON
         * @memberof neutron.FileOperationRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FileOperationRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FileOperationRequest
         * @function getTypeUrl
         * @memberof neutron.FileOperationRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FileOperationRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.FileOperationRequest";
        };

        return FileOperationRequest;
    })();

    neutron.FileOperationResponse = (function() {

        /**
         * Properties of a FileOperationResponse.
         * @memberof neutron
         * @interface IFileOperationResponse
         * @property {boolean|null} [success] FileOperationResponse success
         * @property {google.protobuf.IStruct|null} [result] FileOperationResponse result
         * @property {string|null} [error] FileOperationResponse error
         */

        /**
         * Constructs a new FileOperationResponse.
         * @memberof neutron
         * @classdesc Represents a FileOperationResponse.
         * @implements IFileOperationResponse
         * @constructor
         * @param {neutron.IFileOperationResponse=} [properties] Properties to set
         */
        function FileOperationResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FileOperationResponse success.
         * @member {boolean} success
         * @memberof neutron.FileOperationResponse
         * @instance
         */
        FileOperationResponse.prototype.success = false;

        /**
         * FileOperationResponse result.
         * @member {google.protobuf.IStruct|null|undefined} result
         * @memberof neutron.FileOperationResponse
         * @instance
         */
        FileOperationResponse.prototype.result = null;

        /**
         * FileOperationResponse error.
         * @member {string} error
         * @memberof neutron.FileOperationResponse
         * @instance
         */
        FileOperationResponse.prototype.error = "";

        /**
         * Creates a new FileOperationResponse instance using the specified properties.
         * @function create
         * @memberof neutron.FileOperationResponse
         * @static
         * @param {neutron.IFileOperationResponse=} [properties] Properties to set
         * @returns {neutron.FileOperationResponse} FileOperationResponse instance
         */
        FileOperationResponse.create = function create(properties) {
            return new FileOperationResponse(properties);
        };

        /**
         * Encodes the specified FileOperationResponse message. Does not implicitly {@link neutron.FileOperationResponse.verify|verify} messages.
         * @function encode
         * @memberof neutron.FileOperationResponse
         * @static
         * @param {neutron.IFileOperationResponse} message FileOperationResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FileOperationResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
            if (message.result != null && Object.hasOwnProperty.call(message, "result"))
                $root.google.protobuf.Struct.encode(message.result, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.error);
            return writer;
        };

        /**
         * Encodes the specified FileOperationResponse message, length delimited. Does not implicitly {@link neutron.FileOperationResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.FileOperationResponse
         * @static
         * @param {neutron.IFileOperationResponse} message FileOperationResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FileOperationResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FileOperationResponse message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.FileOperationResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.FileOperationResponse} FileOperationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FileOperationResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.FileOperationResponse();
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
                        message.result = $root.google.protobuf.Struct.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.error = reader.string();
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
         * Decodes a FileOperationResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.FileOperationResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.FileOperationResponse} FileOperationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FileOperationResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FileOperationResponse message.
         * @function verify
         * @memberof neutron.FileOperationResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FileOperationResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.success != null && message.hasOwnProperty("success"))
                if (typeof message.success !== "boolean")
                    return "success: boolean expected";
            if (message.result != null && message.hasOwnProperty("result")) {
                let error = $root.google.protobuf.Struct.verify(message.result);
                if (error)
                    return "result." + error;
            }
            if (message.error != null && message.hasOwnProperty("error"))
                if (!$util.isString(message.error))
                    return "error: string expected";
            return null;
        };

        /**
         * Creates a FileOperationResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.FileOperationResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.FileOperationResponse} FileOperationResponse
         */
        FileOperationResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.FileOperationResponse)
                return object;
            let message = new $root.neutron.FileOperationResponse();
            if (object.success != null)
                message.success = Boolean(object.success);
            if (object.result != null) {
                if (typeof object.result !== "object")
                    throw TypeError(".neutron.FileOperationResponse.result: object expected");
                message.result = $root.google.protobuf.Struct.fromObject(object.result);
            }
            if (object.error != null)
                message.error = String(object.error);
            return message;
        };

        /**
         * Creates a plain object from a FileOperationResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.FileOperationResponse
         * @static
         * @param {neutron.FileOperationResponse} message FileOperationResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FileOperationResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.success = false;
                object.result = null;
                object.error = "";
            }
            if (message.success != null && message.hasOwnProperty("success"))
                object.success = message.success;
            if (message.result != null && message.hasOwnProperty("result"))
                object.result = $root.google.protobuf.Struct.toObject(message.result, options);
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = message.error;
            return object;
        };

        /**
         * Converts this FileOperationResponse to JSON.
         * @function toJSON
         * @memberof neutron.FileOperationResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FileOperationResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FileOperationResponse
         * @function getTypeUrl
         * @memberof neutron.FileOperationResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FileOperationResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.FileOperationResponse";
        };

        return FileOperationResponse;
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
         * @property {boolean|null} [success] PrepareFileReceiveResponse success
         * @property {number|Long|null} [size] PrepareFileReceiveResponse size
         * @property {string|null} [error] PrepareFileReceiveResponse error
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
         * PrepareFileReceiveResponse success.
         * @member {boolean} success
         * @memberof neutron.PrepareFileReceiveResponse
         * @instance
         */
        PrepareFileReceiveResponse.prototype.success = false;

        /**
         * PrepareFileReceiveResponse size.
         * @member {number|Long} size
         * @memberof neutron.PrepareFileReceiveResponse
         * @instance
         */
        PrepareFileReceiveResponse.prototype.size = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * PrepareFileReceiveResponse error.
         * @member {string} error
         * @memberof neutron.PrepareFileReceiveResponse
         * @instance
         */
        PrepareFileReceiveResponse.prototype.error = "";

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
            if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
            if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.size);
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.error);
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
                case 1: {
                        message.success = reader.bool();
                        break;
                    }
                case 2: {
                        message.size = reader.int64();
                        break;
                    }
                case 3: {
                        message.error = reader.string();
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
            if (message.success != null && message.hasOwnProperty("success"))
                if (typeof message.success !== "boolean")
                    return "success: boolean expected";
            if (message.size != null && message.hasOwnProperty("size"))
                if (!$util.isInteger(message.size) && !(message.size && $util.isInteger(message.size.low) && $util.isInteger(message.size.high)))
                    return "size: integer|Long expected";
            if (message.error != null && message.hasOwnProperty("error"))
                if (!$util.isString(message.error))
                    return "error: string expected";
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
            if (object.success != null)
                message.success = Boolean(object.success);
            if (object.size != null)
                if ($util.Long)
                    (message.size = $util.Long.fromValue(object.size)).unsigned = false;
                else if (typeof object.size === "string")
                    message.size = parseInt(object.size, 10);
                else if (typeof object.size === "number")
                    message.size = object.size;
                else if (typeof object.size === "object")
                    message.size = new $util.LongBits(object.size.low >>> 0, object.size.high >>> 0).toNumber();
            if (object.error != null)
                message.error = String(object.error);
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
            if (options.defaults) {
                object.success = false;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.size = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.size = options.longs === String ? "0" : 0;
                object.error = "";
            }
            if (message.success != null && message.hasOwnProperty("success"))
                object.success = message.success;
            if (message.size != null && message.hasOwnProperty("size"))
                if (typeof message.size === "number")
                    object.size = options.longs === String ? String(message.size) : message.size;
                else
                    object.size = options.longs === String ? $util.Long.prototype.toString.call(message.size) : options.longs === Number ? new $util.LongBits(message.size.low >>> 0, message.size.high >>> 0).toNumber() : message.size;
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = message.error;
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

    neutron.GetFileInfoResponse = (function() {

        /**
         * Properties of a GetFileInfoResponse.
         * @memberof neutron
         * @interface IGetFileInfoResponse
         * @property {neutron.IFileInformation|null} [fileInfo] GetFileInfoResponse fileInfo
         * @property {string|null} [error] GetFileInfoResponse error
         */

        /**
         * Constructs a new GetFileInfoResponse.
         * @memberof neutron
         * @classdesc Represents a GetFileInfoResponse.
         * @implements IGetFileInfoResponse
         * @constructor
         * @param {neutron.IGetFileInfoResponse=} [properties] Properties to set
         */
        function GetFileInfoResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetFileInfoResponse fileInfo.
         * @member {neutron.IFileInformation|null|undefined} fileInfo
         * @memberof neutron.GetFileInfoResponse
         * @instance
         */
        GetFileInfoResponse.prototype.fileInfo = null;

        /**
         * GetFileInfoResponse error.
         * @member {string} error
         * @memberof neutron.GetFileInfoResponse
         * @instance
         */
        GetFileInfoResponse.prototype.error = "";

        /**
         * Creates a new GetFileInfoResponse instance using the specified properties.
         * @function create
         * @memberof neutron.GetFileInfoResponse
         * @static
         * @param {neutron.IGetFileInfoResponse=} [properties] Properties to set
         * @returns {neutron.GetFileInfoResponse} GetFileInfoResponse instance
         */
        GetFileInfoResponse.create = function create(properties) {
            return new GetFileInfoResponse(properties);
        };

        /**
         * Encodes the specified GetFileInfoResponse message. Does not implicitly {@link neutron.GetFileInfoResponse.verify|verify} messages.
         * @function encode
         * @memberof neutron.GetFileInfoResponse
         * @static
         * @param {neutron.IGetFileInfoResponse} message GetFileInfoResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFileInfoResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.fileInfo != null && Object.hasOwnProperty.call(message, "fileInfo"))
                $root.neutron.FileInformation.encode(message.fileInfo, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.error);
            return writer;
        };

        /**
         * Encodes the specified GetFileInfoResponse message, length delimited. Does not implicitly {@link neutron.GetFileInfoResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.GetFileInfoResponse
         * @static
         * @param {neutron.IGetFileInfoResponse} message GetFileInfoResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFileInfoResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GetFileInfoResponse message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.GetFileInfoResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.GetFileInfoResponse} GetFileInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFileInfoResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.GetFileInfoResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.fileInfo = $root.neutron.FileInformation.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        message.error = reader.string();
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
         * Decodes a GetFileInfoResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.GetFileInfoResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.GetFileInfoResponse} GetFileInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFileInfoResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetFileInfoResponse message.
         * @function verify
         * @memberof neutron.GetFileInfoResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetFileInfoResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.fileInfo != null && message.hasOwnProperty("fileInfo")) {
                let error = $root.neutron.FileInformation.verify(message.fileInfo);
                if (error)
                    return "fileInfo." + error;
            }
            if (message.error != null && message.hasOwnProperty("error"))
                if (!$util.isString(message.error))
                    return "error: string expected";
            return null;
        };

        /**
         * Creates a GetFileInfoResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.GetFileInfoResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.GetFileInfoResponse} GetFileInfoResponse
         */
        GetFileInfoResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.GetFileInfoResponse)
                return object;
            let message = new $root.neutron.GetFileInfoResponse();
            if (object.fileInfo != null) {
                if (typeof object.fileInfo !== "object")
                    throw TypeError(".neutron.GetFileInfoResponse.fileInfo: object expected");
                message.fileInfo = $root.neutron.FileInformation.fromObject(object.fileInfo);
            }
            if (object.error != null)
                message.error = String(object.error);
            return message;
        };

        /**
         * Creates a plain object from a GetFileInfoResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.GetFileInfoResponse
         * @static
         * @param {neutron.GetFileInfoResponse} message GetFileInfoResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetFileInfoResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.fileInfo = null;
                object.error = "";
            }
            if (message.fileInfo != null && message.hasOwnProperty("fileInfo"))
                object.fileInfo = $root.neutron.FileInformation.toObject(message.fileInfo, options);
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = message.error;
            return object;
        };

        /**
         * Converts this GetFileInfoResponse to JSON.
         * @function toJSON
         * @memberof neutron.GetFileInfoResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetFileInfoResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetFileInfoResponse
         * @function getTypeUrl
         * @memberof neutron.GetFileInfoResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetFileInfoResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.GetFileInfoResponse";
        };

        return GetFileInfoResponse;
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
         * @property {string|null} [error] ListFilesResponse error
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
         * ListFilesResponse error.
         * @member {string} error
         * @memberof neutron.ListFilesResponse
         * @instance
         */
        ListFilesResponse.prototype.error = "";

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
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.error);
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
                case 2: {
                        message.error = reader.string();
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
            if (message.error != null && message.hasOwnProperty("error"))
                if (!$util.isString(message.error))
                    return "error: string expected";
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
            if (object.error != null)
                message.error = String(object.error);
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
            if (options.defaults)
                object.error = "";
            if (message.files && message.files.length) {
                object.files = [];
                for (let j = 0; j < message.files.length; ++j)
                    object.files[j] = $root.neutron.FileInformation.toObject(message.files[j], options);
            }
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = message.error;
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
         * @property {string|null} [error] GetFileSystemVersionResponse error
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
         * GetFileSystemVersionResponse error.
         * @member {string} error
         * @memberof neutron.GetFileSystemVersionResponse
         * @instance
         */
        GetFileSystemVersionResponse.prototype.error = "";

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
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.error);
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
                case 2: {
                        message.error = reader.string();
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
            if (message.error != null && message.hasOwnProperty("error"))
                if (!$util.isString(message.error))
                    return "error: string expected";
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
            if (object.error != null)
                message.error = String(object.error);
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
            if (options.defaults) {
                object.version = "";
                object.error = "";
            }
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = message.error;
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

    neutron.RemoteMessage = (function() {

        /**
         * Properties of a RemoteMessage.
         * @memberof neutron
         * @interface IRemoteMessage
         * @property {string|null} [type] RemoteMessage type
         * @property {string|null} [source] RemoteMessage source
         * @property {string|null} [destination] RemoteMessage destination
         * @property {string|null} [id] RemoteMessage id
         * @property {google.protobuf.IStruct|null} [payload] RemoteMessage payload
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
         * RemoteMessage payload.
         * @member {google.protobuf.IStruct|null|undefined} payload
         * @memberof neutron.RemoteMessage
         * @instance
         */
        RemoteMessage.prototype.payload = null;

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
            if (message.payload != null && Object.hasOwnProperty.call(message, "payload"))
                $root.google.protobuf.Struct.encode(message.payload, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
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
                        message.payload = $root.google.protobuf.Struct.decode(reader, reader.uint32());
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
            if (message.payload != null && message.hasOwnProperty("payload")) {
                let error = $root.google.protobuf.Struct.verify(message.payload);
                if (error)
                    return "payload." + error;
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
            if (object.payload != null) {
                if (typeof object.payload !== "object")
                    throw TypeError(".neutron.RemoteMessage.payload: object expected");
                message.payload = $root.google.protobuf.Struct.fromObject(object.payload);
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
                object.payload = null;
            }
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.source != null && message.hasOwnProperty("source"))
                object.source = message.source;
            if (message.destination != null && message.hasOwnProperty("destination"))
                object.destination = message.destination;
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.payload != null && message.hasOwnProperty("payload"))
                object.payload = $root.google.protobuf.Struct.toObject(message.payload, options);
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

    neutron.Candidate = (function() {

        /**
         * Properties of a Candidate.
         * @memberof neutron
         * @interface ICandidate
         * @property {string|null} [candidate] Candidate candidate
         * @property {string|null} [sdpMid] Candidate sdpMid
         * @property {number|null} [sdpMLineIndex] Candidate sdpMLineIndex
         * @property {string|null} [usernameFragment] Candidate usernameFragment
         */

        /**
         * Constructs a new Candidate.
         * @memberof neutron
         * @classdesc Represents a Candidate.
         * @implements ICandidate
         * @constructor
         * @param {neutron.ICandidate=} [properties] Properties to set
         */
        function Candidate(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Candidate candidate.
         * @member {string} candidate
         * @memberof neutron.Candidate
         * @instance
         */
        Candidate.prototype.candidate = "";

        /**
         * Candidate sdpMid.
         * @member {string} sdpMid
         * @memberof neutron.Candidate
         * @instance
         */
        Candidate.prototype.sdpMid = "";

        /**
         * Candidate sdpMLineIndex.
         * @member {number} sdpMLineIndex
         * @memberof neutron.Candidate
         * @instance
         */
        Candidate.prototype.sdpMLineIndex = 0;

        /**
         * Candidate usernameFragment.
         * @member {string} usernameFragment
         * @memberof neutron.Candidate
         * @instance
         */
        Candidate.prototype.usernameFragment = "";

        /**
         * Creates a new Candidate instance using the specified properties.
         * @function create
         * @memberof neutron.Candidate
         * @static
         * @param {neutron.ICandidate=} [properties] Properties to set
         * @returns {neutron.Candidate} Candidate instance
         */
        Candidate.create = function create(properties) {
            return new Candidate(properties);
        };

        /**
         * Encodes the specified Candidate message. Does not implicitly {@link neutron.Candidate.verify|verify} messages.
         * @function encode
         * @memberof neutron.Candidate
         * @static
         * @param {neutron.ICandidate} message Candidate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Candidate.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.candidate != null && Object.hasOwnProperty.call(message, "candidate"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.candidate);
            if (message.sdpMid != null && Object.hasOwnProperty.call(message, "sdpMid"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.sdpMid);
            if (message.sdpMLineIndex != null && Object.hasOwnProperty.call(message, "sdpMLineIndex"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.sdpMLineIndex);
            if (message.usernameFragment != null && Object.hasOwnProperty.call(message, "usernameFragment"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.usernameFragment);
            return writer;
        };

        /**
         * Encodes the specified Candidate message, length delimited. Does not implicitly {@link neutron.Candidate.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.Candidate
         * @static
         * @param {neutron.ICandidate} message Candidate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Candidate.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Candidate message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.Candidate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.Candidate} Candidate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Candidate.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.Candidate();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.candidate = reader.string();
                        break;
                    }
                case 2: {
                        message.sdpMid = reader.string();
                        break;
                    }
                case 3: {
                        message.sdpMLineIndex = reader.int32();
                        break;
                    }
                case 4: {
                        message.usernameFragment = reader.string();
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
         * Decodes a Candidate message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.Candidate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.Candidate} Candidate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Candidate.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Candidate message.
         * @function verify
         * @memberof neutron.Candidate
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Candidate.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.candidate != null && message.hasOwnProperty("candidate"))
                if (!$util.isString(message.candidate))
                    return "candidate: string expected";
            if (message.sdpMid != null && message.hasOwnProperty("sdpMid"))
                if (!$util.isString(message.sdpMid))
                    return "sdpMid: string expected";
            if (message.sdpMLineIndex != null && message.hasOwnProperty("sdpMLineIndex"))
                if (!$util.isInteger(message.sdpMLineIndex))
                    return "sdpMLineIndex: integer expected";
            if (message.usernameFragment != null && message.hasOwnProperty("usernameFragment"))
                if (!$util.isString(message.usernameFragment))
                    return "usernameFragment: string expected";
            return null;
        };

        /**
         * Creates a Candidate message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.Candidate
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.Candidate} Candidate
         */
        Candidate.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.Candidate)
                return object;
            let message = new $root.neutron.Candidate();
            if (object.candidate != null)
                message.candidate = String(object.candidate);
            if (object.sdpMid != null)
                message.sdpMid = String(object.sdpMid);
            if (object.sdpMLineIndex != null)
                message.sdpMLineIndex = object.sdpMLineIndex | 0;
            if (object.usernameFragment != null)
                message.usernameFragment = String(object.usernameFragment);
            return message;
        };

        /**
         * Creates a plain object from a Candidate message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.Candidate
         * @static
         * @param {neutron.Candidate} message Candidate
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Candidate.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.candidate = "";
                object.sdpMid = "";
                object.sdpMLineIndex = 0;
                object.usernameFragment = "";
            }
            if (message.candidate != null && message.hasOwnProperty("candidate"))
                object.candidate = message.candidate;
            if (message.sdpMid != null && message.hasOwnProperty("sdpMid"))
                object.sdpMid = message.sdpMid;
            if (message.sdpMLineIndex != null && message.hasOwnProperty("sdpMLineIndex"))
                object.sdpMLineIndex = message.sdpMLineIndex;
            if (message.usernameFragment != null && message.hasOwnProperty("usernameFragment"))
                object.usernameFragment = message.usernameFragment;
            return object;
        };

        /**
         * Converts this Candidate to JSON.
         * @function toJSON
         * @memberof neutron.Candidate
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Candidate.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Candidate
         * @function getTypeUrl
         * @memberof neutron.Candidate
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Candidate.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.Candidate";
        };

        return Candidate;
    })();

    neutron.WebRTCOffer = (function() {

        /**
         * Properties of a WebRTCOffer.
         * @memberof neutron
         * @interface IWebRTCOffer
         * @property {string|null} [sdp] WebRTCOffer sdp
         * @property {Array.<neutron.ICandidate>|null} [candidates] WebRTCOffer candidates
         */

        /**
         * Constructs a new WebRTCOffer.
         * @memberof neutron
         * @classdesc Represents a WebRTCOffer.
         * @implements IWebRTCOffer
         * @constructor
         * @param {neutron.IWebRTCOffer=} [properties] Properties to set
         */
        function WebRTCOffer(properties) {
            this.candidates = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WebRTCOffer sdp.
         * @member {string} sdp
         * @memberof neutron.WebRTCOffer
         * @instance
         */
        WebRTCOffer.prototype.sdp = "";

        /**
         * WebRTCOffer candidates.
         * @member {Array.<neutron.ICandidate>} candidates
         * @memberof neutron.WebRTCOffer
         * @instance
         */
        WebRTCOffer.prototype.candidates = $util.emptyArray;

        /**
         * Creates a new WebRTCOffer instance using the specified properties.
         * @function create
         * @memberof neutron.WebRTCOffer
         * @static
         * @param {neutron.IWebRTCOffer=} [properties] Properties to set
         * @returns {neutron.WebRTCOffer} WebRTCOffer instance
         */
        WebRTCOffer.create = function create(properties) {
            return new WebRTCOffer(properties);
        };

        /**
         * Encodes the specified WebRTCOffer message. Does not implicitly {@link neutron.WebRTCOffer.verify|verify} messages.
         * @function encode
         * @memberof neutron.WebRTCOffer
         * @static
         * @param {neutron.IWebRTCOffer} message WebRTCOffer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WebRTCOffer.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sdp != null && Object.hasOwnProperty.call(message, "sdp"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.sdp);
            if (message.candidates != null && message.candidates.length)
                for (let i = 0; i < message.candidates.length; ++i)
                    $root.neutron.Candidate.encode(message.candidates[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified WebRTCOffer message, length delimited. Does not implicitly {@link neutron.WebRTCOffer.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.WebRTCOffer
         * @static
         * @param {neutron.IWebRTCOffer} message WebRTCOffer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WebRTCOffer.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WebRTCOffer message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.WebRTCOffer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.WebRTCOffer} WebRTCOffer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WebRTCOffer.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.WebRTCOffer();
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
                        if (!(message.candidates && message.candidates.length))
                            message.candidates = [];
                        message.candidates.push($root.neutron.Candidate.decode(reader, reader.uint32()));
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
         * Decodes a WebRTCOffer message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.WebRTCOffer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.WebRTCOffer} WebRTCOffer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WebRTCOffer.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WebRTCOffer message.
         * @function verify
         * @memberof neutron.WebRTCOffer
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WebRTCOffer.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sdp != null && message.hasOwnProperty("sdp"))
                if (!$util.isString(message.sdp))
                    return "sdp: string expected";
            if (message.candidates != null && message.hasOwnProperty("candidates")) {
                if (!Array.isArray(message.candidates))
                    return "candidates: array expected";
                for (let i = 0; i < message.candidates.length; ++i) {
                    let error = $root.neutron.Candidate.verify(message.candidates[i]);
                    if (error)
                        return "candidates." + error;
                }
            }
            return null;
        };

        /**
         * Creates a WebRTCOffer message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.WebRTCOffer
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.WebRTCOffer} WebRTCOffer
         */
        WebRTCOffer.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.WebRTCOffer)
                return object;
            let message = new $root.neutron.WebRTCOffer();
            if (object.sdp != null)
                message.sdp = String(object.sdp);
            if (object.candidates) {
                if (!Array.isArray(object.candidates))
                    throw TypeError(".neutron.WebRTCOffer.candidates: array expected");
                message.candidates = [];
                for (let i = 0; i < object.candidates.length; ++i) {
                    if (typeof object.candidates[i] !== "object")
                        throw TypeError(".neutron.WebRTCOffer.candidates: object expected");
                    message.candidates[i] = $root.neutron.Candidate.fromObject(object.candidates[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a WebRTCOffer message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.WebRTCOffer
         * @static
         * @param {neutron.WebRTCOffer} message WebRTCOffer
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WebRTCOffer.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.candidates = [];
            if (options.defaults)
                object.sdp = "";
            if (message.sdp != null && message.hasOwnProperty("sdp"))
                object.sdp = message.sdp;
            if (message.candidates && message.candidates.length) {
                object.candidates = [];
                for (let j = 0; j < message.candidates.length; ++j)
                    object.candidates[j] = $root.neutron.Candidate.toObject(message.candidates[j], options);
            }
            return object;
        };

        /**
         * Converts this WebRTCOffer to JSON.
         * @function toJSON
         * @memberof neutron.WebRTCOffer
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WebRTCOffer.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WebRTCOffer
         * @function getTypeUrl
         * @memberof neutron.WebRTCOffer
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WebRTCOffer.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.WebRTCOffer";
        };

        return WebRTCOffer;
    })();

    neutron.WebRTCAnswer = (function() {

        /**
         * Properties of a WebRTCAnswer.
         * @memberof neutron
         * @interface IWebRTCAnswer
         * @property {string|null} [sdp] WebRTCAnswer sdp
         * @property {Array.<neutron.ICandidate>|null} [candidates] WebRTCAnswer candidates
         */

        /**
         * Constructs a new WebRTCAnswer.
         * @memberof neutron
         * @classdesc Represents a WebRTCAnswer.
         * @implements IWebRTCAnswer
         * @constructor
         * @param {neutron.IWebRTCAnswer=} [properties] Properties to set
         */
        function WebRTCAnswer(properties) {
            this.candidates = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WebRTCAnswer sdp.
         * @member {string} sdp
         * @memberof neutron.WebRTCAnswer
         * @instance
         */
        WebRTCAnswer.prototype.sdp = "";

        /**
         * WebRTCAnswer candidates.
         * @member {Array.<neutron.ICandidate>} candidates
         * @memberof neutron.WebRTCAnswer
         * @instance
         */
        WebRTCAnswer.prototype.candidates = $util.emptyArray;

        /**
         * Creates a new WebRTCAnswer instance using the specified properties.
         * @function create
         * @memberof neutron.WebRTCAnswer
         * @static
         * @param {neutron.IWebRTCAnswer=} [properties] Properties to set
         * @returns {neutron.WebRTCAnswer} WebRTCAnswer instance
         */
        WebRTCAnswer.create = function create(properties) {
            return new WebRTCAnswer(properties);
        };

        /**
         * Encodes the specified WebRTCAnswer message. Does not implicitly {@link neutron.WebRTCAnswer.verify|verify} messages.
         * @function encode
         * @memberof neutron.WebRTCAnswer
         * @static
         * @param {neutron.IWebRTCAnswer} message WebRTCAnswer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WebRTCAnswer.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sdp != null && Object.hasOwnProperty.call(message, "sdp"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.sdp);
            if (message.candidates != null && message.candidates.length)
                for (let i = 0; i < message.candidates.length; ++i)
                    $root.neutron.Candidate.encode(message.candidates[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified WebRTCAnswer message, length delimited. Does not implicitly {@link neutron.WebRTCAnswer.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.WebRTCAnswer
         * @static
         * @param {neutron.IWebRTCAnswer} message WebRTCAnswer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WebRTCAnswer.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WebRTCAnswer message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.WebRTCAnswer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.WebRTCAnswer} WebRTCAnswer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WebRTCAnswer.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.WebRTCAnswer();
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
                        if (!(message.candidates && message.candidates.length))
                            message.candidates = [];
                        message.candidates.push($root.neutron.Candidate.decode(reader, reader.uint32()));
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
         * Decodes a WebRTCAnswer message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.WebRTCAnswer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.WebRTCAnswer} WebRTCAnswer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WebRTCAnswer.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WebRTCAnswer message.
         * @function verify
         * @memberof neutron.WebRTCAnswer
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WebRTCAnswer.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sdp != null && message.hasOwnProperty("sdp"))
                if (!$util.isString(message.sdp))
                    return "sdp: string expected";
            if (message.candidates != null && message.hasOwnProperty("candidates")) {
                if (!Array.isArray(message.candidates))
                    return "candidates: array expected";
                for (let i = 0; i < message.candidates.length; ++i) {
                    let error = $root.neutron.Candidate.verify(message.candidates[i]);
                    if (error)
                        return "candidates." + error;
                }
            }
            return null;
        };

        /**
         * Creates a WebRTCAnswer message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.WebRTCAnswer
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.WebRTCAnswer} WebRTCAnswer
         */
        WebRTCAnswer.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.WebRTCAnswer)
                return object;
            let message = new $root.neutron.WebRTCAnswer();
            if (object.sdp != null)
                message.sdp = String(object.sdp);
            if (object.candidates) {
                if (!Array.isArray(object.candidates))
                    throw TypeError(".neutron.WebRTCAnswer.candidates: array expected");
                message.candidates = [];
                for (let i = 0; i < object.candidates.length; ++i) {
                    if (typeof object.candidates[i] !== "object")
                        throw TypeError(".neutron.WebRTCAnswer.candidates: object expected");
                    message.candidates[i] = $root.neutron.Candidate.fromObject(object.candidates[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a WebRTCAnswer message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.WebRTCAnswer
         * @static
         * @param {neutron.WebRTCAnswer} message WebRTCAnswer
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WebRTCAnswer.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.candidates = [];
            if (options.defaults)
                object.sdp = "";
            if (message.sdp != null && message.hasOwnProperty("sdp"))
                object.sdp = message.sdp;
            if (message.candidates && message.candidates.length) {
                object.candidates = [];
                for (let j = 0; j < message.candidates.length; ++j)
                    object.candidates[j] = $root.neutron.Candidate.toObject(message.candidates[j], options);
            }
            return object;
        };

        /**
         * Converts this WebRTCAnswer to JSON.
         * @function toJSON
         * @memberof neutron.WebRTCAnswer
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WebRTCAnswer.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WebRTCAnswer
         * @function getTypeUrl
         * @memberof neutron.WebRTCAnswer
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WebRTCAnswer.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.WebRTCAnswer";
        };

        return WebRTCAnswer;
    })();

    neutron.FileTransferRequest = (function() {

        /**
         * Properties of a FileTransferRequest.
         * @memberof neutron
         * @interface IFileTransferRequest
         * @property {string|null} [path] FileTransferRequest path
         * @property {string|null} [label] FileTransferRequest label
         * @property {number|Long|null} [offset] FileTransferRequest offset
         * @property {number|Long|null} [size] FileTransferRequest size
         * @property {string|null} [mimeType] FileTransferRequest mimeType
         */

        /**
         * Constructs a new FileTransferRequest.
         * @memberof neutron
         * @classdesc Represents a FileTransferRequest.
         * @implements IFileTransferRequest
         * @constructor
         * @param {neutron.IFileTransferRequest=} [properties] Properties to set
         */
        function FileTransferRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FileTransferRequest path.
         * @member {string} path
         * @memberof neutron.FileTransferRequest
         * @instance
         */
        FileTransferRequest.prototype.path = "";

        /**
         * FileTransferRequest label.
         * @member {string} label
         * @memberof neutron.FileTransferRequest
         * @instance
         */
        FileTransferRequest.prototype.label = "";

        /**
         * FileTransferRequest offset.
         * @member {number|Long} offset
         * @memberof neutron.FileTransferRequest
         * @instance
         */
        FileTransferRequest.prototype.offset = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * FileTransferRequest size.
         * @member {number|Long} size
         * @memberof neutron.FileTransferRequest
         * @instance
         */
        FileTransferRequest.prototype.size = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * FileTransferRequest mimeType.
         * @member {string} mimeType
         * @memberof neutron.FileTransferRequest
         * @instance
         */
        FileTransferRequest.prototype.mimeType = "";

        /**
         * Creates a new FileTransferRequest instance using the specified properties.
         * @function create
         * @memberof neutron.FileTransferRequest
         * @static
         * @param {neutron.IFileTransferRequest=} [properties] Properties to set
         * @returns {neutron.FileTransferRequest} FileTransferRequest instance
         */
        FileTransferRequest.create = function create(properties) {
            return new FileTransferRequest(properties);
        };

        /**
         * Encodes the specified FileTransferRequest message. Does not implicitly {@link neutron.FileTransferRequest.verify|verify} messages.
         * @function encode
         * @memberof neutron.FileTransferRequest
         * @static
         * @param {neutron.IFileTransferRequest} message FileTransferRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FileTransferRequest.encode = function encode(message, writer) {
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
            if (message.mimeType != null && Object.hasOwnProperty.call(message, "mimeType"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.mimeType);
            return writer;
        };

        /**
         * Encodes the specified FileTransferRequest message, length delimited. Does not implicitly {@link neutron.FileTransferRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.FileTransferRequest
         * @static
         * @param {neutron.IFileTransferRequest} message FileTransferRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FileTransferRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FileTransferRequest message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.FileTransferRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.FileTransferRequest} FileTransferRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FileTransferRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.FileTransferRequest();
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
                case 5: {
                        message.mimeType = reader.string();
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
         * Decodes a FileTransferRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.FileTransferRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.FileTransferRequest} FileTransferRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FileTransferRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FileTransferRequest message.
         * @function verify
         * @memberof neutron.FileTransferRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FileTransferRequest.verify = function verify(message) {
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
            if (message.mimeType != null && message.hasOwnProperty("mimeType"))
                if (!$util.isString(message.mimeType))
                    return "mimeType: string expected";
            return null;
        };

        /**
         * Creates a FileTransferRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.FileTransferRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.FileTransferRequest} FileTransferRequest
         */
        FileTransferRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.FileTransferRequest)
                return object;
            let message = new $root.neutron.FileTransferRequest();
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
            if (object.mimeType != null)
                message.mimeType = String(object.mimeType);
            return message;
        };

        /**
         * Creates a plain object from a FileTransferRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.FileTransferRequest
         * @static
         * @param {neutron.FileTransferRequest} message FileTransferRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FileTransferRequest.toObject = function toObject(message, options) {
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
                object.mimeType = "";
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
            if (message.mimeType != null && message.hasOwnProperty("mimeType"))
                object.mimeType = message.mimeType;
            return object;
        };

        /**
         * Converts this FileTransferRequest to JSON.
         * @function toJSON
         * @memberof neutron.FileTransferRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FileTransferRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FileTransferRequest
         * @function getTypeUrl
         * @memberof neutron.FileTransferRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FileTransferRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.FileTransferRequest";
        };

        return FileTransferRequest;
    })();

    neutron.FileTransferResponse = (function() {

        /**
         * Properties of a FileTransferResponse.
         * @memberof neutron
         * @interface IFileTransferResponse
         * @property {boolean|null} [success] FileTransferResponse success
         * @property {number|Long|null} [size] FileTransferResponse size
         * @property {string|null} [error] FileTransferResponse error
         * @property {string|null} [id] FileTransferResponse id
         */

        /**
         * Constructs a new FileTransferResponse.
         * @memberof neutron
         * @classdesc Represents a FileTransferResponse.
         * @implements IFileTransferResponse
         * @constructor
         * @param {neutron.IFileTransferResponse=} [properties] Properties to set
         */
        function FileTransferResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FileTransferResponse success.
         * @member {boolean} success
         * @memberof neutron.FileTransferResponse
         * @instance
         */
        FileTransferResponse.prototype.success = false;

        /**
         * FileTransferResponse size.
         * @member {number|Long} size
         * @memberof neutron.FileTransferResponse
         * @instance
         */
        FileTransferResponse.prototype.size = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * FileTransferResponse error.
         * @member {string} error
         * @memberof neutron.FileTransferResponse
         * @instance
         */
        FileTransferResponse.prototype.error = "";

        /**
         * FileTransferResponse id.
         * @member {string} id
         * @memberof neutron.FileTransferResponse
         * @instance
         */
        FileTransferResponse.prototype.id = "";

        /**
         * Creates a new FileTransferResponse instance using the specified properties.
         * @function create
         * @memberof neutron.FileTransferResponse
         * @static
         * @param {neutron.IFileTransferResponse=} [properties] Properties to set
         * @returns {neutron.FileTransferResponse} FileTransferResponse instance
         */
        FileTransferResponse.create = function create(properties) {
            return new FileTransferResponse(properties);
        };

        /**
         * Encodes the specified FileTransferResponse message. Does not implicitly {@link neutron.FileTransferResponse.verify|verify} messages.
         * @function encode
         * @memberof neutron.FileTransferResponse
         * @static
         * @param {neutron.IFileTransferResponse} message FileTransferResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FileTransferResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
            if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.size);
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.error);
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.id);
            return writer;
        };

        /**
         * Encodes the specified FileTransferResponse message, length delimited. Does not implicitly {@link neutron.FileTransferResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.FileTransferResponse
         * @static
         * @param {neutron.IFileTransferResponse} message FileTransferResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FileTransferResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FileTransferResponse message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.FileTransferResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.FileTransferResponse} FileTransferResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FileTransferResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.FileTransferResponse();
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
                        message.size = reader.int64();
                        break;
                    }
                case 3: {
                        message.error = reader.string();
                        break;
                    }
                case 4: {
                        message.id = reader.string();
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
         * Decodes a FileTransferResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.FileTransferResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.FileTransferResponse} FileTransferResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FileTransferResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FileTransferResponse message.
         * @function verify
         * @memberof neutron.FileTransferResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FileTransferResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.success != null && message.hasOwnProperty("success"))
                if (typeof message.success !== "boolean")
                    return "success: boolean expected";
            if (message.size != null && message.hasOwnProperty("size"))
                if (!$util.isInteger(message.size) && !(message.size && $util.isInteger(message.size.low) && $util.isInteger(message.size.high)))
                    return "size: integer|Long expected";
            if (message.error != null && message.hasOwnProperty("error"))
                if (!$util.isString(message.error))
                    return "error: string expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            return null;
        };

        /**
         * Creates a FileTransferResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.FileTransferResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.FileTransferResponse} FileTransferResponse
         */
        FileTransferResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.FileTransferResponse)
                return object;
            let message = new $root.neutron.FileTransferResponse();
            if (object.success != null)
                message.success = Boolean(object.success);
            if (object.size != null)
                if ($util.Long)
                    (message.size = $util.Long.fromValue(object.size)).unsigned = false;
                else if (typeof object.size === "string")
                    message.size = parseInt(object.size, 10);
                else if (typeof object.size === "number")
                    message.size = object.size;
                else if (typeof object.size === "object")
                    message.size = new $util.LongBits(object.size.low >>> 0, object.size.high >>> 0).toNumber();
            if (object.error != null)
                message.error = String(object.error);
            if (object.id != null)
                message.id = String(object.id);
            return message;
        };

        /**
         * Creates a plain object from a FileTransferResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.FileTransferResponse
         * @static
         * @param {neutron.FileTransferResponse} message FileTransferResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FileTransferResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.success = false;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.size = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.size = options.longs === String ? "0" : 0;
                object.error = "";
                object.id = "";
            }
            if (message.success != null && message.hasOwnProperty("success"))
                object.success = message.success;
            if (message.size != null && message.hasOwnProperty("size"))
                if (typeof message.size === "number")
                    object.size = options.longs === String ? String(message.size) : message.size;
                else
                    object.size = options.longs === String ? $util.Long.prototype.toString.call(message.size) : options.longs === Number ? new $util.LongBits(message.size.low >>> 0, message.size.high >>> 0).toNumber() : message.size;
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = message.error;
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            return object;
        };

        /**
         * Converts this FileTransferResponse to JSON.
         * @function toJSON
         * @memberof neutron.FileTransferResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FileTransferResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FileTransferResponse
         * @function getTypeUrl
         * @memberof neutron.FileTransferResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FileTransferResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.FileTransferResponse";
        };

        return FileTransferResponse;
    })();

    neutron.ThumbnailRequest = (function() {

        /**
         * Properties of a ThumbnailRequest.
         * @memberof neutron
         * @interface IThumbnailRequest
         * @property {string|null} [path] ThumbnailRequest path
         * @property {number|null} [maxSize] ThumbnailRequest maxSize
         */

        /**
         * Constructs a new ThumbnailRequest.
         * @memberof neutron
         * @classdesc Represents a ThumbnailRequest.
         * @implements IThumbnailRequest
         * @constructor
         * @param {neutron.IThumbnailRequest=} [properties] Properties to set
         */
        function ThumbnailRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ThumbnailRequest path.
         * @member {string} path
         * @memberof neutron.ThumbnailRequest
         * @instance
         */
        ThumbnailRequest.prototype.path = "";

        /**
         * ThumbnailRequest maxSize.
         * @member {number} maxSize
         * @memberof neutron.ThumbnailRequest
         * @instance
         */
        ThumbnailRequest.prototype.maxSize = 0;

        /**
         * Creates a new ThumbnailRequest instance using the specified properties.
         * @function create
         * @memberof neutron.ThumbnailRequest
         * @static
         * @param {neutron.IThumbnailRequest=} [properties] Properties to set
         * @returns {neutron.ThumbnailRequest} ThumbnailRequest instance
         */
        ThumbnailRequest.create = function create(properties) {
            return new ThumbnailRequest(properties);
        };

        /**
         * Encodes the specified ThumbnailRequest message. Does not implicitly {@link neutron.ThumbnailRequest.verify|verify} messages.
         * @function encode
         * @memberof neutron.ThumbnailRequest
         * @static
         * @param {neutron.IThumbnailRequest} message ThumbnailRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ThumbnailRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
            if (message.maxSize != null && Object.hasOwnProperty.call(message, "maxSize"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.maxSize);
            return writer;
        };

        /**
         * Encodes the specified ThumbnailRequest message, length delimited. Does not implicitly {@link neutron.ThumbnailRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.ThumbnailRequest
         * @static
         * @param {neutron.IThumbnailRequest} message ThumbnailRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ThumbnailRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ThumbnailRequest message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.ThumbnailRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.ThumbnailRequest} ThumbnailRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ThumbnailRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.ThumbnailRequest();
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
                        message.maxSize = reader.int32();
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
         * Decodes a ThumbnailRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.ThumbnailRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.ThumbnailRequest} ThumbnailRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ThumbnailRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ThumbnailRequest message.
         * @function verify
         * @memberof neutron.ThumbnailRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ThumbnailRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.path != null && message.hasOwnProperty("path"))
                if (!$util.isString(message.path))
                    return "path: string expected";
            if (message.maxSize != null && message.hasOwnProperty("maxSize"))
                if (!$util.isInteger(message.maxSize))
                    return "maxSize: integer expected";
            return null;
        };

        /**
         * Creates a ThumbnailRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.ThumbnailRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.ThumbnailRequest} ThumbnailRequest
         */
        ThumbnailRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.ThumbnailRequest)
                return object;
            let message = new $root.neutron.ThumbnailRequest();
            if (object.path != null)
                message.path = String(object.path);
            if (object.maxSize != null)
                message.maxSize = object.maxSize | 0;
            return message;
        };

        /**
         * Creates a plain object from a ThumbnailRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.ThumbnailRequest
         * @static
         * @param {neutron.ThumbnailRequest} message ThumbnailRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ThumbnailRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.path = "";
                object.maxSize = 0;
            }
            if (message.path != null && message.hasOwnProperty("path"))
                object.path = message.path;
            if (message.maxSize != null && message.hasOwnProperty("maxSize"))
                object.maxSize = message.maxSize;
            return object;
        };

        /**
         * Converts this ThumbnailRequest to JSON.
         * @function toJSON
         * @memberof neutron.ThumbnailRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ThumbnailRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ThumbnailRequest
         * @function getTypeUrl
         * @memberof neutron.ThumbnailRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ThumbnailRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.ThumbnailRequest";
        };

        return ThumbnailRequest;
    })();

    neutron.ThumbnailResponse = (function() {

        /**
         * Properties of a ThumbnailResponse.
         * @memberof neutron
         * @interface IThumbnailResponse
         * @property {string|null} [id] ThumbnailResponse id
         * @property {number|null} [width] ThumbnailResponse width
         * @property {number|null} [height] ThumbnailResponse height
         * @property {string|null} [error] ThumbnailResponse error
         */

        /**
         * Constructs a new ThumbnailResponse.
         * @memberof neutron
         * @classdesc Represents a ThumbnailResponse.
         * @implements IThumbnailResponse
         * @constructor
         * @param {neutron.IThumbnailResponse=} [properties] Properties to set
         */
        function ThumbnailResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ThumbnailResponse id.
         * @member {string} id
         * @memberof neutron.ThumbnailResponse
         * @instance
         */
        ThumbnailResponse.prototype.id = "";

        /**
         * ThumbnailResponse width.
         * @member {number} width
         * @memberof neutron.ThumbnailResponse
         * @instance
         */
        ThumbnailResponse.prototype.width = 0;

        /**
         * ThumbnailResponse height.
         * @member {number} height
         * @memberof neutron.ThumbnailResponse
         * @instance
         */
        ThumbnailResponse.prototype.height = 0;

        /**
         * ThumbnailResponse error.
         * @member {string} error
         * @memberof neutron.ThumbnailResponse
         * @instance
         */
        ThumbnailResponse.prototype.error = "";

        /**
         * Creates a new ThumbnailResponse instance using the specified properties.
         * @function create
         * @memberof neutron.ThumbnailResponse
         * @static
         * @param {neutron.IThumbnailResponse=} [properties] Properties to set
         * @returns {neutron.ThumbnailResponse} ThumbnailResponse instance
         */
        ThumbnailResponse.create = function create(properties) {
            return new ThumbnailResponse(properties);
        };

        /**
         * Encodes the specified ThumbnailResponse message. Does not implicitly {@link neutron.ThumbnailResponse.verify|verify} messages.
         * @function encode
         * @memberof neutron.ThumbnailResponse
         * @static
         * @param {neutron.IThumbnailResponse} message ThumbnailResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ThumbnailResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.width != null && Object.hasOwnProperty.call(message, "width"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.width);
            if (message.height != null && Object.hasOwnProperty.call(message, "height"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.height);
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.error);
            return writer;
        };

        /**
         * Encodes the specified ThumbnailResponse message, length delimited. Does not implicitly {@link neutron.ThumbnailResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof neutron.ThumbnailResponse
         * @static
         * @param {neutron.IThumbnailResponse} message ThumbnailResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ThumbnailResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ThumbnailResponse message from the specified reader or buffer.
         * @function decode
         * @memberof neutron.ThumbnailResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {neutron.ThumbnailResponse} ThumbnailResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ThumbnailResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.neutron.ThumbnailResponse();
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
                        message.width = reader.int32();
                        break;
                    }
                case 3: {
                        message.height = reader.int32();
                        break;
                    }
                case 4: {
                        message.error = reader.string();
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
         * Decodes a ThumbnailResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof neutron.ThumbnailResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {neutron.ThumbnailResponse} ThumbnailResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ThumbnailResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ThumbnailResponse message.
         * @function verify
         * @memberof neutron.ThumbnailResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ThumbnailResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.width != null && message.hasOwnProperty("width"))
                if (!$util.isInteger(message.width))
                    return "width: integer expected";
            if (message.height != null && message.hasOwnProperty("height"))
                if (!$util.isInteger(message.height))
                    return "height: integer expected";
            if (message.error != null && message.hasOwnProperty("error"))
                if (!$util.isString(message.error))
                    return "error: string expected";
            return null;
        };

        /**
         * Creates a ThumbnailResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof neutron.ThumbnailResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {neutron.ThumbnailResponse} ThumbnailResponse
         */
        ThumbnailResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.neutron.ThumbnailResponse)
                return object;
            let message = new $root.neutron.ThumbnailResponse();
            if (object.id != null)
                message.id = String(object.id);
            if (object.width != null)
                message.width = object.width | 0;
            if (object.height != null)
                message.height = object.height | 0;
            if (object.error != null)
                message.error = String(object.error);
            return message;
        };

        /**
         * Creates a plain object from a ThumbnailResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof neutron.ThumbnailResponse
         * @static
         * @param {neutron.ThumbnailResponse} message ThumbnailResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ThumbnailResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.width = 0;
                object.height = 0;
                object.error = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.width != null && message.hasOwnProperty("width"))
                object.width = message.width;
            if (message.height != null && message.hasOwnProperty("height"))
                object.height = message.height;
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = message.error;
            return object;
        };

        /**
         * Converts this ThumbnailResponse to JSON.
         * @function toJSON
         * @memberof neutron.ThumbnailResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ThumbnailResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ThumbnailResponse
         * @function getTypeUrl
         * @memberof neutron.ThumbnailResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ThumbnailResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/neutron.ThumbnailResponse";
        };

        return ThumbnailResponse;
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

        return protobuf;
    })();

    return google;
})();

export { $root as default };
