import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  AlertIOS,
  ScrollView,
  ActivityIndicator,
  ListView
} from 'react-native';
import ProgressImage from './ProgressImage';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import mainStyles from '../styles/components/_Main';
import indicatorStyles from '../styles/common/_Indicator';
import styles from '../styles/components/_TopicDetail';
import Header from './Header';
import ReplyModal from './modal/ReplyModal';
import Comment from './Comment';
import VoteList from './VoteList';
import { PopButton, ReplyButton, CommentButton } from './button';
import { fetchTopic, resetTopic, publish, publishVote, resetVote } from '../actions/topic/topicAction';
import { parseContentWithImage } from '../utils/app';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class TopicDetail extends Component {
  constructor(props) {
    super(props);
    this.topicId = props.passProps.topic_id;
    this.boardId = props.passProps.board_id;
    this.boardName = props.passProps.board_name;
  }

  componentDidMount() {
    this.fetchTopic();
  }

  componentWillUnmount() {
    this.props.dispatch(resetTopic());
  }

  componentWillReceiveProps(nextProps) {
    let { topicItem } = nextProps.entity;

    if (topicItem.errCode) {
      AlertIOS.alert('提示', topicItem.errCode);
      nextProps.dispatch(resetTopic());
      nextProps.router.pop();
    }
  }

  fetchTopic() {
    this.props.dispatch(fetchTopic(this.topicId));
  }

  _endReached() {
    let {
      hasMore,
      isFetching,
      isEndReached,
      page
    } = this.props.entity.topicItem;

    if (!hasMore || isFetching || isEndReached) { return; }

    this.props.dispatch(fetchTopic(this.topicId, true, page + 1));
  }

  _renderHeader(topic, token, vote) {
    let create_date = moment(+topic.create_date).startOf('minute').fromNow();
    let commentHeaderText =
      topic.replies > 0 ? (topic.replies + '条评论') : '还没有评论，快来抢沙发！';

    return (
      <View>
        <View>
          <Text style={styles.title}>{topic.title}</Text>
          <View style={styles.info}>
            <Icon
              style={styles.views}
              name='eye'>
              {topic.hits}
            </Icon>
            <Icon
              style={styles.comments}
              name='comments'>
              {topic.replies}
            </Icon>
          </View>
        </View>
        <View style={styles.postContent}>
          <View style={styles.authorInfo}>
            <View style={styles.avatarWapper}>
              <Image
               style={styles.avatar}
               source={{ uri: topic.icon }} />
            </View>
            <View style={styles.author}>
              <Text style={styles.name}>{topic.user_nick_name}</Text>
              <Text style={styles.level}>{topic.userTitle}</Text>
            </View>
            <Text style={styles.floor}>楼主</Text>
          </View>
          <View style={styles.content}>
            {topic.content.map((content, index) => {
              switch (content.type) {
                // text
                case 0:
                default:
                  return <Text key={index}
                               style={styles.contentItem}>
                           {parseContentWithImage(content.infor)}
                         </Text>;
                // pic
                case 1:
                  return <ProgressImage key={index}
                                        style={styles.contentItem}
                                        uri={content.originalInfo} />;
              }
            })}
            {topic.poll_info &&
              <VoteList
                pollInfo={topic.poll_info}
                vote={vote}
                publishVote={voteIds => this._publishVote(voteIds)}
                resetVote={() => this._resetVote()}
                fetchTopic={() => this.fetchTopic()} />
            }
          </View>
          <View style={styles.other}>
            <Text style={styles.date}>{create_date}</Text>
            {!!topic.mobileSign &&
              <View style={styles.mobileWrapper}>
                <Icon style={styles.mobileIcon} name='mobile' />
                <Text style={styles.mobileText}>{topic.mobileSign}</Text>
              </View>
            }
            {token &&
              <CommentButton
                style={styles.reply}
                onPress={() => this._openReplyModal(topic)} />
            }
          </View>
        </View>
        <View style={styles.commentHeader}>
          <Text style={styles.commentHeaderText}>
            {commentHeaderText}
          </Text>
        </View>
        <View style={styles.commentHeaderSpace}></View>
      </View>
    );
  }

  _renderFooter() {
    let {
      hasMore,
      isEndReached
    } = this.props.entity.topicItem;

    if (!hasMore || !isEndReached) { return; }

    return (
      <View style={indicatorStyles.endRechedIndicator}>
        <ActivityIndicator />
      </View>
    );
  }

  _publish(comment, replyId) {
    this.props.dispatch(publish(
      this.boardId,
      this.topicId,
      replyId,
      null,
      null,
      comment
    ));
  }

  _publishVote(voteIds) {
    this.props.dispatch(publishVote(
      this.topicId,
      voteIds
    ));
  }

  _resetVote() {
    this.props.dispatch(resetVote());
  }

  _openReplyModal(comment) {
    this._replyModal.openReplyModal(comment);
  }

  render() {
    let { topicItem, comment, vote, user } = this.props.entity;

    if (topicItem.isFetching || !topicItem.topic || !topicItem.topic.topic_id) {
      return (
        <View style={mainStyles.container}>
          <Header title={this.boardName}>
            <PopButton router={this.props.router} />
          </Header>
          <View style={indicatorStyles.fullScreenIndicator}>
            <ActivityIndicator />
          </View>
        </View>
      );
    }

    let topic = topicItem.topic;
    let token = user.authrization.token;
    let commentSource = ds.cloneWithRows(topicItem.list);

    return (
      <View style={mainStyles.container}>
        <ReplyModal
          ref={component => this._replyModal = component}
          {...this.props}
          visible={false}
          comment={comment}
          handlePublish={(content, replyId) => this._publish(content, replyId)}
          fetchTopic={() => this.fetchTopic()} />

        <Header title={this.boardName}>
          <PopButton router={this.props.router} />
          {token &&
            <ReplyButton onPress={() => this._openReplyModal()} />
            ||
            <Text></Text>
          }
        </Header>
        <ListView
          style={styles.commentList}
          dataSource={commentSource}
          enableEmptySections={true}
          renderRow={comment =>
            <Comment
              key={comment.reply_posts_id}
              comment={comment}
              token={token}
              openReplyModal={() => this._openReplyModal(comment)} />
          }
          onEndReached={() => this._endReached()}
          onEndReachedThreshold={0}
          renderHeader={() => this._renderHeader(topic, token, vote)}
          renderFooter={() => this._renderFooter()} />
      </View>
    );
  }
}

module.exports = TopicDetail;
