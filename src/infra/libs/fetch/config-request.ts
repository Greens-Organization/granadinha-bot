import {
  version as packageVersion,
  name as projectName
} from '../../../../package.json'

export class ConfigRequest {
  static readonly PROJECT_VERSION = packageVersion
  static readonly PROJECT_NAME = projectName
  static readonly MEDIA_TYPE = 'application/vnd.bot+json' // [NOT FOUND USAGE]

  static readonly Headers = {
    AUTHORIZATION: 'Authorization',
    ACCEPT: 'Accept',
    CONTENT_TYPE: 'Content-Type',
    USER_AGENT: 'User-Agent'
  }

  static getRuntimeVersion(): string {
    return process.version
  }

  static getRuntimeArchitecture(): string {
    return process.arch
  }

  static getRuntimePlataform(): string {
    return process.platform
  }

  static getUserAgent(): string {
    return `${ConfigRequest.PROJECT_NAME} v${
      ConfigRequest.PROJECT_VERSION
    } (node ${ConfigRequest.getRuntimeVersion()} - ${ConfigRequest.getRuntimeArchitecture()} - ${ConfigRequest.getRuntimePlataform()})`
  }
}
