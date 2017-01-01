/* global strings Windows */
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Immutable from 'immutable';

import { fullWhite, minBlack, grey100, fullBlack, darkWhite } from 'material-ui/styles/colors';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

import ActionSwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ContentClear from 'material-ui/svg-icons/content/clear';
import NavigationMoreVert from 'material-ui/svg-icons/navigation/more-vert';
import ImageCameraAlt from 'material-ui/svg-icons/image/camera-alt';
import ImageImage from 'material-ui/svg-icons/image/image';
import ContentGesture from 'material-ui/svg-icons/content/gesture';
import AVVolumeUp from 'material-ui/svg-icons/av/volume-up';
import AVStop from 'material-ui/svg-icons/av/stop';
import AVMic from 'material-ui/svg-icons/av/mic';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import SocialShare from 'material-ui/svg-icons/social/share';
import EditorFormatSize from 'material-ui/svg-icons/editor/format-size';
import ActionSwapVert from 'material-ui/svg-icons/action/swap-vert';
import ToggleStarBorder from 'material-ui/svg-icons/toggle/star-border';
import ToggleStar from 'material-ui/svg-icons/toggle/star';
import NavigationFullscreen from 'material-ui/svg-icons/navigation/fullscreen';
import NavigationFullscreenExit from 'material-ui/svg-icons/navigation/fullscreen-exit';
import ActionLightbulbOutline from 'material-ui/svg-icons/action/lightbulb-outline';

import {
  isOutput,
  isTtsSupported,
  isVoiceRecognitionSupported,
  isHandwritingSupported,
  isOcrSupported,
  toCountryRemovedLanguage,
} from '../libs/languageUtils';

import { swapLanguages, updateInputLang, updateOutputLang } from '../actions/settings';
import {
  updateInputText,
  translate,
  updateImeMode,
  togglePhrasebook,
  toggleFullscreenInputBox,
} from '../actions/home';
import { loadImage } from '../actions/ocr';
import { playTextToSpeech, stopTextToSpeech } from '../actions/textToSpeech';

import copyToClipboard from '../libs/copyToClipboard';
import shareText from '../libs/shareText';

import Dictionary from './Dictionary';
import Handwriting from './Handwriting';
import Speech from './Speech';
import History from './History';

class Home extends React.Component {
  componentDidMount() {
    if (process.env.PLATFORM === 'windows') {
      const { preventScreenLock } = this.props;
      if (preventScreenLock === true) {
        this.dispRequest = new Windows.System.Display.DisplayRequest();
        this.dispRequest.requestActive();
      }
    }
  }
  componentWillUnmount() {
    if (process.env.PLATFORM === 'windows') {
      if (this.dispRequest) {
        this.dispRequest.requestRelease();
      }
    }
  }

  getStyles() {
    const { theme, fullscreenInputBox } = this.props;

    const {
      palette: {
        textColor,
      },
      appBar,
      button: {
        iconButtonSize,
      },
    } = this.context.muiTheme;

    return {
      container: {
        flex: 1,
        backgroundColor: (theme === 'dark') ? fullBlack : grey100,
        display: 'flex',
        overflow: 'hidden',
      },
      anotherContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      },
      innerContainer: {
        flex: 1,
        display: 'flex',
      },
      languageTitle: {
        flex: 1,
        overflow: 'hidden',
        margin: 0,
        paddingTop: 0,
        letterSpacing: 0,
        fontSize: 16,
        fontWeight: appBar.titleFontWeight,
        color: appBar.textColor,
        height: appBar.height,
        lineHeight: `${appBar.height}px`,
        display: 'flex',
        justifyContent: 'center',
        WebkitUserSelect: 'none',
        cursor: 'pointer',
      },
      languageTitleSpan: {
        float: 'left',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      dropDownIconContainer: {
        height: appBar.height,
        paddingTop: (appBar.height - iconButtonSize) / 2,
        float: 'left',
      },
      swapIconContainer: {
        paddingTop: (appBar.height - iconButtonSize) / 2,
      },
      inputContainer: {
        flex: fullscreenInputBox ? 1 : null,
        height: fullscreenInputBox ? null : 140,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      },
      textarea: {
        border: 0,
        color: (theme === 'dark') ? fullWhite : null,
        backgroundColor: (theme === 'dark') ? '#303030' : fullWhite,
        outline: 0,
        margin: 0,
        padding: 12,
        fontSize: 16,
        boxSizing: 'border-box',
        flex: 1,
      },
      controllerContainer: {
        flexBasis: 48,
        paddingLeft: 8,
        paddingRight: 8,
        boxSizing: 'border-box',
        borderTop: `1px solid ${(theme === 'dark') ? darkWhite : minBlack}`,
      },
      controllerContainerLeft: {
        float: 'left',
      },
      controllerContainerRight: {
        float: 'right',
        paddingTop: 6,
      },
      resultContainer: {
        display: fullscreenInputBox ? 'none' : null,
        flex: 1,
        padding: '0 12px 12px 12px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      },
      progressContainer: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      inputRoman: {
        color: textColor,
        margin: '6px 0 0 0',
        padding: 0,
        fontSize: 14,
      },
      suggestion: {
        color: textColor,
        margin: '12px 0 0 0',
        padding: 0,
        fontSize: 15,
        height: 24,
      },
      suggestionSvg: {
        float: 'left',
        height: 24,
        width: 24,
      },
      suggestionSpan: {
        lineHeight: '24px',
        float: 'left',
      },
      outputText: {
        fontSize: 16,
        whiteSpace: 'pre-wrap',
      },
      outputRoman: {
        fontSize: 15,
      },
      outputCard: {
        marginTop: 12,
      },
      googleCopyright: {
        fontSize: 14,
        textAlign: 'right',
      },
    };
  }

  renderOutput(styles) {
    const {
      output, screenWidth, fullscreenInputBox,
      textToSpeechPlaying, onListenButtonTouchTap,
      onTogglePhrasebookTouchTap,
      onSwapOutputButtonTouchTap,
      onBiggerTextButtonTouchTap,
      onSuggestedInputLangTouchTap,
      onSuggestedInputTextTouchTap,
    } = this.props;

    if (fullscreenInputBox === true) {
      return null;
    }

    if (!output) return <History />;

    switch (output.get('status')) {
      case 'loading': {
        return (
          <div style={styles.progressContainer} >
            <CircularProgress size={80} thickness={5} />
          </div>
        );
      }
      default: {
        const controllers = [
          {
            icon: output.has('phrasebookId') ? <ToggleStar /> : <ToggleStarBorder />,
            tooltip: output.has('phrasebookId') ? strings.removeFromPhrasebook : strings.addToPhrasebook,
            onTouchTap: onTogglePhrasebookTouchTap,
          },
          {
            icon: <ActionSwapVert />,
            tooltip: strings.swap,
            onTouchTap: () => onSwapOutputButtonTouchTap(
              output.get('outputLang'),
              output.get('inputLang'),
              output.get('outputText'),
            ),
          },
          {
            icon: <EditorFormatSize />,
            tooltip: strings.biggerText,
            onTouchTap: () => onBiggerTextButtonTouchTap(output.get('outputText')),
          },
          {
            icon: <ContentCopy />,
            tooltip: strings.copy,
            onTouchTap: () => copyToClipboard(output.get('outputText')),
          },
        ];

        if (isTtsSupported(output.get('outputLang'))) {
          controllers.unshift({
            icon: textToSpeechPlaying ? <AVStop /> : <AVVolumeUp />,
            tooltip: textToSpeechPlaying ? strings.stop : strings.listen,
            onTouchTap: () => onListenButtonTouchTap(textToSpeechPlaying, output.get('outputLang'), output.get('outputText')),
          });
        }

        if (process.env.PLATFORM !== 'mac') {
          controllers.push({
            icon: <SocialShare />,
            tooltip: strings.share,
            onTouchTap: () => shareText(output.get('outputText')),
          });
        }

        const maxVisibleIcon = Math.min(Math.round((screenWidth - 120) / 56), controllers.length);
        const showMoreButton = (maxVisibleIcon < controllers.length);

        const hasDict = output.get('inputDict') !== undefined && output.get('outputDict') !== undefined;

        return (
          <div style={styles.resultContainer}>
            {output.get('inputRoman') ? (
              <p className="text-selectable" style={styles.inputRoman}>{output.get('inputRoman')}</p>
            ) : null}

            {output.get('suggestedInputLang') ? (
              <p style={styles.suggestion}>
                <ActionLightbulbOutline style={styles.suggestionSvg} />
                <span style={styles.suggestionSpan}>
                  <span>{strings.translateFrom}: </span>
                  <a onTouchTap={() => onSuggestedInputLangTouchTap(output.get('suggestedInputLang'))}>
                    {strings[output.get('suggestedInputLang')]}
                  </a> ?
                </span>
              </p>
            ) : null}

            {output.get('suggestedInputText') ? (
              <p style={styles.suggestion}>
                <ActionLightbulbOutline style={styles.suggestionSvg} />
                <span style={styles.suggestionSpan}>
                  <span>{strings.didYouMean}: </span>
                  <a onTouchTap={() => onSuggestedInputTextTouchTap(output.get('suggestedInputText'))}>
                    {output.get('suggestedInputText')}
                  </a> ?
                </span>
              </p>
            ) : null}

            <Card initiallyExpanded style={styles.outputCard}>
              <CardHeader
                title={strings[output.get('outputLang')]}
                subtitle={strings.fromLanguage.replace('{1}', strings[output.get('inputLang')])}
                actAsExpander={hasDict}
                showExpandableButton={hasDict}
              />
              <CardText className="text-selectable" style={styles.outputText} lang={toCountryRemovedLanguage(output.get('outputLang'))}>
                {output.get('outputText')}
              </CardText>
              {output.get('outputRoman') ? (
                <CardText className="text-selectable" style={styles.outputRoman}>
                  {output.get('outputRoman')}
                </CardText>
              ) : null}
              <CardActions>
                {
                  controllers.slice(0, maxVisibleIcon)
                  .map(({ icon, tooltip, onTouchTap }, i) => (
                    <IconButton
                      tooltip={tooltip}
                      tooltipPosition="bottom-center"
                      key={`dIconButton_${i}`}
                      onTouchTap={onTouchTap}
                    >
                      {icon}
                    </IconButton>
                  ))
                }
                {(showMoreButton) ? (
                  <IconMenu
                    iconButtonElement={(
                      <IconButton tooltip={strings.more} tooltipPosition="bottom-center">
                        <NavigationMoreVert />
                      </IconButton>
                    )}
                    anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                  >
                    {
                      controllers
                        .slice(maxVisibleIcon, controllers.length)
                        .map(({ icon, tooltip, onTouchTap }, i) => (
                          <MenuItem
                            primaryText={tooltip}
                            leftIcon={icon}
                            key={`dMenuItem_${i}`}
                            onTouchTap={onTouchTap}
                          />
                        ))
                    }
                  </IconMenu>
                ) : null}
              </CardActions>
              {hasDict ? (
                <CardText expandable>
                  <Dictionary output={output} />
                </CardText>
              ) : null}
            </Card>
            <p style={styles.googleCopyright}>{strings.translatedByGoogle}</p>
          </div>
        );
      }
    }
  }

  render() {
    const {
      screenWidth,
      translateWhenPressingEnter,
      inputLang, outputLang,
      inputText,
      imeMode,
      textToSpeechPlaying,
      fullscreenInputBox,
      onLanguageTouchTap, onSwapButtonTouchTap,
      onKeyDown, onInputText,
      onClearButtonTouchTap,
      onListenButtonTouchTap,
      onWriteButtonTouchTap,
      onSpeakButtonTouchTap,
      onTranslateButtonTouchTap,
      onOpenImageButtonTouchTap,
      onCameraButtonTouchTap,
      onFullscreenButtonTouchTap,
      onAnotherContainerTouchTap,
    } = this.props;
    const styles = this.getStyles();

    const controllers = [
      {
        icon: <ContentClear />,
        tooltip: strings.clear,
        onTouchTap: onClearButtonTouchTap,
      },
    ];

    if (isTtsSupported(inputLang)) {
      controllers.push({
        icon: textToSpeechPlaying ? <AVStop /> : <AVVolumeUp />,
        tooltip: textToSpeechPlaying ? strings.stop : strings.listen,
        onTouchTap: () => onListenButtonTouchTap(textToSpeechPlaying, inputLang, inputText),
      });
    }

    if (isVoiceRecognitionSupported(inputLang)) {
      controllers.push({
        icon: <AVMic />,
        tooltip: strings.speak,
        onTouchTap: onSpeakButtonTouchTap,
      });
    }

    if (isHandwritingSupported(inputLang)) {
      controllers.push({
        icon: <ContentGesture />,
        tooltip: strings.draw,
        onTouchTap: onWriteButtonTouchTap,
      });
    }

    if (isOcrSupported(inputLang)) {
      controllers.push({
        icon: <ImageImage />,
        tooltip: strings.openImageFile,
        onTouchTap: onOpenImageButtonTouchTap,
      });
    }

    controllers.push({
      icon: fullscreenInputBox ? <NavigationFullscreenExit /> : <NavigationFullscreen />,
      tooltip: fullscreenInputBox ? strings.exitFullscreen : strings.fullscreen,
      onTouchTap: onFullscreenButtonTouchTap,
    });

    if (process.env.PLATFORM === 'windows') {
      if (isOcrSupported(inputLang)) {
        controllers.splice(controllers.length - 2, 0, {
          icon: <ImageCameraAlt />,
          tooltip: strings.camera,
          onTouchTap: onCameraButtonTouchTap,
        });
      }
    }

    const maxVisibleIcon = Math.min(Math.round((screenWidth - 200) / 56), controllers.length);

    const showMoreButton = (maxVisibleIcon < controllers.length);

    const tooltipPos = fullscreenInputBox ? 'top-center' : 'bottom-center';

    return (
      <div style={styles.container}>
        <div style={styles.anotherContainer} onTouchTap={() => onAnotherContainerTouchTap(imeMode)}>
          <AppBar
            showMenuIconButton={false}
            title={(
              <div style={styles.innerContainer}>
                <div style={styles.languageTitle} onTouchTap={() => onLanguageTouchTap('inputLang')}>
                  <span style={styles.languageTitleSpan}>{strings[inputLang]}</span>
                  <div style={styles.dropDownIconContainer}>
                    <NavigationArrowDropDown color={fullWhite} />
                  </div>
                </div>
                <div style={styles.swapIconContainer} onTouchTap={onSwapButtonTouchTap}>
                  <IconButton disabled={!isOutput(inputLang)}>
                    <ActionSwapHoriz color={fullWhite} />
                  </IconButton>
                </div>
                <div style={styles.languageTitle} onTouchTap={() => onLanguageTouchTap('outputLang')}>
                  <span style={styles.languageTitleSpan}>{strings[outputLang]}</span>
                  <div style={styles.dropDownIconContainer}>
                    <NavigationArrowDropDown color={fullWhite} />
                  </div>
                </div>
              </div>
            )}
          />
          <Paper zDepth={2} style={styles.inputContainer}>
            <textarea
              className="text-selectable"
              lang={toCountryRemovedLanguage(inputLang)}
              style={styles.textarea}
              placeholder={strings.typeSomethingHere}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              onKeyDown={translateWhenPressingEnter ? e => onKeyDown(e) : null}
              onInput={onInputText}
              onKeyUp={onInputText}
              onTouchTap={onInputText}
              onChange={onInputText}
              value={inputText}
            />
            <div style={styles.controllerContainer}>
              <div style={styles.controllerContainerLeft}>
                {
                  controllers.slice(0, maxVisibleIcon)
                  .map(({ icon, tooltip, onTouchTap }, i) => (
                    <IconButton
                      tooltip={tooltip}
                      tooltipPosition={tooltipPos}
                      key={`dIconButton_${i}`}
                      onTouchTap={onTouchTap}
                    >
                      {icon}
                    </IconButton>
                  ))
                }
                {(showMoreButton) ? (
                  <IconMenu
                    iconButtonElement={(
                      <IconButton tooltip={strings.more} tooltipPosition={tooltipPos}>
                        <NavigationMoreVert />
                      </IconButton>
                    )}
                    anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                  >
                    {
                      controllers
                        .slice(maxVisibleIcon, controllers.length)
                        .map(({ icon, tooltip, onTouchTap }, i) => (
                          <MenuItem
                            primaryText={tooltip}
                            leftIcon={icon}
                            key={`dMenuItem_${i}`}
                            onTouchTap={onTouchTap}
                          />
                        ))
                    }
                  </IconMenu>
                ) : null}
              </div>
              <div style={styles.controllerContainerRight}>
                <RaisedButton
                  label={strings.translate}
                  primary
                  onTouchTap={onTranslateButtonTouchTap}
                />
              </div>
            </div>
          </Paper>
          {this.renderOutput(styles)}
        </div>
        {imeMode === 'handwriting' ? <Handwriting /> : null}
        {imeMode === 'speech' ? <Speech /> : null}
      </div>
    );
  }
}

Home.propTypes = {
  screenWidth: React.PropTypes.number,
  theme: React.PropTypes.string,
  translateWhenPressingEnter: React.PropTypes.bool,
  preventScreenLock: React.PropTypes.bool,
  inputLang: React.PropTypes.string,
  outputLang: React.PropTypes.string,
  inputText: React.PropTypes.string,
  output: React.PropTypes.instanceOf(Immutable.Map),
  imeMode: React.PropTypes.string,
  textToSpeechPlaying: React.PropTypes.bool,
  fullscreenInputBox: React.PropTypes.bool,
  onLanguageTouchTap: React.PropTypes.func,
  onSwapButtonTouchTap: React.PropTypes.func,
  onKeyDown: React.PropTypes.func,
  onInputText: React.PropTypes.func,
  onClearButtonTouchTap: React.PropTypes.func,
  onListenButtonTouchTap: React.PropTypes.func,
  onTranslateButtonTouchTap: React.PropTypes.func,
  onWriteButtonTouchTap: React.PropTypes.func,
  onSpeakButtonTouchTap: React.PropTypes.func,
  onTogglePhrasebookTouchTap: React.PropTypes.func,
  onOpenImageButtonTouchTap: React.PropTypes.func,
  onCameraButtonTouchTap: React.PropTypes.func,
  onSwapOutputButtonTouchTap: React.PropTypes.func,
  onBiggerTextButtonTouchTap: React.PropTypes.func,
  onFullscreenButtonTouchTap: React.PropTypes.func,
  onSuggestedInputLangTouchTap: React.PropTypes.func,
  onSuggestedInputTextTouchTap: React.PropTypes.func,
  onAnotherContainerTouchTap: React.PropTypes.func,
};

const mapStateToProps = state => ({
  screenWidth: state.screen.screenWidth,
  theme: state.settings.theme,
  translateWhenPressingEnter: state.settings.translateWhenPressingEnter,
  preventScreenLock: state.settings.preventingScreenLock,
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
  inputText: state.home.inputText,
  output: state.home.output,
  imeMode: state.home.imeMode,
  textToSpeechPlaying: state.textToSpeech.textToSpeechPlaying,
  fullscreenInputBox: state.home.fullscreenInputBox,
});

const mapDispatchToProps = dispatch => ({
  onLanguageTouchTap: (type) => {
    dispatch(push({
      pathname: '/language-list',
      query: { type },
    }));
  },
  onSwapButtonTouchTap: () => {
    dispatch(swapLanguages());
  },
  onKeyDown: (e) => {
    if ((e.keyCode || e.which) === 13) {
      dispatch(translate(true));
      e.target.blur();
    }

    const inputText = e.target.value;

    dispatch(updateInputText(inputText, e.target.selectionStart, e.target.selectionEnd));
  },
  onInputText: (e) => {
    const inputText = e.target.value;

    dispatch(updateInputText(inputText, e.target.selectionStart, e.target.selectionEnd));
  },
  onClearButtonTouchTap: () => {
    dispatch(updateInputText(''));
  },
  onListenButtonTouchTap: (toStop, lang, text) => {
    if (toStop) {
      dispatch(stopTextToSpeech());
      return;
    }
    dispatch(playTextToSpeech(lang, text));
  },
  onTranslateButtonTouchTap: () => {
    dispatch(translate(true));
  },
  onWriteButtonTouchTap: () => {
    dispatch(updateImeMode('handwriting'));
  },
  onSpeakButtonTouchTap: () => {
    dispatch(updateImeMode('speech'));
  },
  onTogglePhrasebookTouchTap: () => {
    dispatch(togglePhrasebook());
  },
  onOpenImageButtonTouchTap: () => {
    dispatch(loadImage(false));
  },
  onCameraButtonTouchTap: () => {
    dispatch(loadImage(true));
  },
  onSwapOutputButtonTouchTap: (inputLang, outputLang, inputText) => {
    dispatch(updateInputLang(inputLang));
    dispatch(updateOutputLang(outputLang));
    dispatch(updateInputText(inputText));
  },
  onBiggerTextButtonTouchTap: (text) => {
    dispatch(push({
      pathname: '/bigger-text',
      query: { text },
    }));
  },
  onFullscreenButtonTouchTap: () => {
    dispatch(toggleFullscreenInputBox());
  },
  onSuggestedInputLangTouchTap: (value) => {
    dispatch(updateInputLang(value));
  },
  onSuggestedInputTextTouchTap: (text) => {
    dispatch(updateInputText(text));
  },
  onAnotherContainerTouchTap: (imeMode) => {
    if (imeMode) dispatch(updateImeMode(null));
  },
});

Home.contextTypes = {
  muiTheme: React.PropTypes.object,
};

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Home);