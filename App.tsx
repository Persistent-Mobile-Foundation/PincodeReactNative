/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  DeviceEventEmitter,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {WLResourceRequest, WLClient} from 'react-native-ibm-mobilefirst';
import colors from './assets/styles/colors';
import prompt from 'react-native-prompt-android';

const securityCheckName = 'PinCodeAttempts';

export class PinCodeChallengeHandler {
  // Handle Challenge
  handleChallenge = challenge => {
    var msg = '';
    // Create the title string for the prompt
    if (challenge.errorMsg !== null) {
      msg = challenge.errorMsg + '\n';
    } else {
      msg = 'This data requires a PIN code.\n';
    }
    msg += 'Remaining attempts: ' + challenge.remainingAttempts;

    Platform.OS === 'ios'
      ? Alert.prompt('Alert', msg, [
          {
            text: 'Cancel',
            onPress: () => WLClient.cancelChallenge(securityCheckName),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: pin =>
              WLClient.submitChallengeAnswer(securityCheckName, {pin: pin}),
          },
        ])
      : prompt(
          'Alert',
          msg,
          [
            {
              text: 'Cancel',
              onPress: () => WLClient.cancelChallenge(securityCheckName),
            },
            {
              text: 'OK',
              onPress: pin =>
                WLClient.submitChallengeAnswer(securityCheckName, {pin: pin}),
            },
          ],
          {
            type: 'secure-text',
            cancelable: false,

            placeholder: 'placeholder',
          },
        );
  };
  // Handle Success
  handleSuccess = success => {};

  //Handle Failure
  handleFailure = error => {
    console.log('Challenge Handler Failure!');
    if (error.failure !== null && error.failure !== undefined) {
      alert(error.failure);
    } else {
      alert('Unknown error');
    }
  };
}

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: '',
    };

    this.getBalance = this.getBalance.bind(this);
  }

  async componentDidMount() {
    // register challenge handlerr
    var challengeHandler = new PinCodeChallengeHandler();
    WLClient.registerChallengeHandler(challengeHandler, securityCheckName);
    console.log('Inside componentDidMount', challengeHandler);
  }

  getBalance(done) {
    var resourceRequest = new WLResourceRequest(
      '/adapters/ResourceAdapter/balance',
      WLResourceRequest.GET,
    );
    console.log('clicked', resourceRequest);
    resourceRequest.send().then(
      response => {
        console.log('resourceRequest.send success: ' + response.responseText);
        this.setState({
          result:
            'SUCCESS' + '\n\n' + 'Total Balance : ' + response.responseText,
        });
        done();
      },
      error => {
        console.log('resourceRequest.send failure: ' + JSON.stringify(error));
        this.setState({
          result: 'FAILURE' + '\n\n' + 'Failed to fetch Balance',
        });
        done();
      },
    );
  }

  render() {
    return (
      <View style={[styles.container, styles.screenbg]}>
        <Text style={styles.title}>
          Get the balance after entering the correct pin code
        </Text>
        <View style={styles.testItemsContainer}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              // justifyContent: "center",
              width: '100%',
              padding: 10,
            }}>
            <TouchableOpacity
              onPress={done => {
                this.getBalance(done);
              }}>
              <View style={styles.buttonStyle}>
                <Text style={styles.textStyle}>Get Balance</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.testResultsContainer}>
          <Text
            style={{
              color: 'black',
              fontSize: 20,
              textAlign: 'center',
              marginVertical: 5,
            }}>
            RESULTS
          </Text>
          <Text style={{color: 'black', fontSize: 16, margin: 10}}>
            {this.state.result}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: '#ededed',
  },
  testItemsContainer: {
    marginTop: 30,
    height: '60%',
    width: '100%',
  },
  testResultsContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#ddd',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 0,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
    margin: 15,
  },
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: colors.buttonColor,
    padding: 10,
    margin: 10,
    borderRadius: 5,
    color: colors.textColor,
  },
  buttonContainer: {
    margin: 5,
  },
  button: {
    marginBottom: 10,
    fontWeight: '500',
  },
  charan: {
    alignItems: 'center',
  },
  screenbg: {
    backgroundColor: '#fff',
    flex: 1,
  },
  textStyle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
