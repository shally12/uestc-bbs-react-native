import { StyleSheet } from 'react-native';
import colors from '../common/_colors';

module.exports = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.underlay
  },
  item: {
    margin: 10,
  },
  title: {
    fontSize: 18,
    textAlign: 'left',
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
  },
  forum: {
    color: colors.mainField,
  },
  details: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 3,
  },
  date: {
    flex: 1,
    textAlign: 'left',
    color: colors.mainField,
    marginTop: 4,
  },
  avatar: {
    height: 25,
    width: 25,
    marginLeft: 5,
    borderRadius: 5,
  },
  name: {
    color: colors.mainField,
    marginTop: 4,
  },
  forumInfo: {
    padding: 3,
    borderRadius: 2,
    backgroundColor: colors.lightBlue,
  },
  forumName: {
    color: colors.white,
  },
  viewsInfo: {
    color: colors.mainField,
    textAlign: 'left',
  },
  commentsInfo: {
    marginLeft: 5,
    color: colors.mainField,
    textAlign: 'left',
  },
});
