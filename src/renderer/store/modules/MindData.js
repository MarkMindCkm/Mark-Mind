const state = {
  folderPath: '',
  mindData: {
    theme: "markdown",
    mindData: [],
    induceData: [],
    wireFrameData: [],
    relateLinkData: [],
    calloutData: [],
    marks: []
  },
  images: { //cache zip images

  },
  openFile: '',
  needSave: false,
  vip: {
    vip: false
  },
  openOnedrive: {
    id: '',
    name: ''
  },
  oneDrive: {
    list: {},
    opened: false,
    id: ''
  },
  oneRoot: {
    name: 'Markmind'
  },
  tag: 'local',
  showOneDrive: false,
  tomato: false
}

const mutations = {
  SET_MIND_DATA(state, data) {
    state.mindData = data;
  },
  SET_FOLDER_PATH(state, path) {
    state.folderPath = path;
  },
  ADD_MIND_MARK(state, data) {
    state.mindData.marks.push(data);
  },
  SET_IMAGE(state, data) {
    state.images[data.name] = data.image;
  },
  SET_PATH(state, data) {
    state.folderPath = data.path;
  },
  SET_OPENFILE(state, data) {
    state.openFile = data
  },
  SET_VIP(state, data) {
    state.vip = data;
  },
  SET_NEEDSAVE(state, data) {
    state.needSave = data;
  },
  SET_ONEDRIVE(state, data) {
    state.oneDrive = data;
  },
  SET_ONEDRIVEROOT(state, data) {
    state.oneRoot = data;
  },
  SET_TAG(state, data) {
    state.tag = data;
  },
  SET_OPENONE(state, data) {
    state.openOnedrive = data;
  },
  SET_ONEDRIVESHOW(state, data) {
    state.showOneDrive = data
  },
  SET_TOMATO(state, data) {
    state.tomato = data
  }
}

const actions = {
  setMindData({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_MIND_DATA', payload);
      resolve();
    });
  },

  setFolderPath({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_FOLDER_PATH', payload);
      resolve();
    });
  },
  addMindMark({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('ADD_MIND_MARK', payload);
      resolve();
    });
  },
  setImage({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_IMAGE', payload);
      resolve();
    });
  },
  setFilePath({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_PATH', payload);
      resolve()
    })
  },
  setOpenFile({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_OPENFILE', payload);
      resolve()
    });
  },
  setNeedSave({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_NEEDSAVE', payload);
      resolve()
    });
  },
  vip({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_VIP', payload);
      resolve()
    });
  },
  setOnedrive({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_ONEDRIVE', payload);
      resolve()
    });
  },
  setOneRoot({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_ONEDRIVEROOT', payload);
      resolve()
    });
  },
  setTag({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_TAG', payload);
      resolve()
    });
  },

  setOpenOnedrive({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_OPENONE', payload);
      resolve()
    });
  },
  setShowOneDrive({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_ONEDRIVESHOW', payload);
      resolve()
    });
  },
  setTomato({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_TOMATO', payload);
      resolve()
    });
  }
}


function listToTree(list) {
  var obj = {};
  var root = null;
  list.forEach(d => {
    if (!obj[d.id]) {
      obj[d.id] = d;
      d.children = [];
    }
    if (d.pid) {
      if (obj[d.pid]) {
        obj[d.pid].children.push(d);
        d.children = [];
      }
    } else {
      root = d;
    }

  });
  return root;
}

const getters = {
  getData(state) {
    var root = null
    var mindData = JSON.parse(JSON.stringify(state.mindData))


    mindData.mindData.forEach((data, i) => {
      if (i == 0) {
        root = listToTree(data);
      } else {
        root.children.push(listToTree(data));
      }
    });

    if (mindData.induceData && mindData.induceData.length) {
      mindData.induceData.forEach(d => {

        root.children.push(listToTree(d.mindData));
      });
    }

    return root;
  },
  getList() {

  },
  getFolderPath(state) {
    return state.folderPath;
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}