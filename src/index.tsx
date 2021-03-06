/**
 * @class ReactDetectOfflineAPI
 */

import * as React from 'react'

export type Props = {
  apiUrl: string,
  render?: Function,
  checkInterval: number | null,
  onOnline?: Function,
  onOffline?: Function,
  initialStatusCallback?: (status :boolean) => void,
}

type State = {
  online: boolean | null,
}

function timeout(ms: number, promise: Promise<any>) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error("timeout"))
    }, ms);
    promise.then(resolve, reject);
  })
}

export default class ReactDetectOfflineAPI extends React.Component<Props, State> {

  private interval: any;

  state = {
    online: null,
  };

  checkTimeout = () => {
    const {
      apiUrl,
    } = this.props;

    timeout(3000, fetch(apiUrl).then(() => {
      this.setState(({online}) => {
        if (this.props.onOnline && online === false) {
          this.props.onOnline()
        }

        if (this.props.initialStatusCallback && online === null) {
          this.props.initialStatusCallback(true)
        }

        return {online: true}
      })
    })).catch(() => {
      this.setState(({online}) => {
        if (this.props.onOffline && online === true) {
          this.props.onOffline()
        }

        if (this.props.initialStatusCallback && online === null) {
          this.props.initialStatusCallback(false)
        }

        return {online: false}
      })
    })
  };

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.apiUrl !== this.props.apiUrl) {
      this.checkTimeout()
    }
  }

  componentDidMount() {
    this.checkTimeout();
    this.interval = this.props.checkInterval !== null
      ?
      setInterval(this.checkTimeout, this.props.checkInterval)
      :
      null
  }

  componentWillUnmount(): void {
    if (this.interval !== null) {
      clearInterval(this.interval)
    }
  }

  render() {
    // Return null before we check for the first time
    if (this.state.online === null) {
      return null
    }

    return (
      <React.Fragment>
        {this.props.render && this.props.render({
          online: this.state.online,
        })}
      </React.Fragment>
    )
  }
}
