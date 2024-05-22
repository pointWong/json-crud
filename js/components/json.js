const ObjectComp = {
  name: 'ObjectComp',
  template: `
    <div class="vue3-table">
      <table>
        <thead>
          <tr>
            <th v-for="(column, index) in columns" :key="index">{{ column }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="([key,value], index) in Object.entries(data)" :key="index">
            <td>{{ key }}</td>
            <td>
              <div class="display-flex" v-if="value instanceof Object">
                <span class="line-clamp-1">{{JSON.stringify(value).slice(0,200)}}</span>
              </div>
              <div v-else>
                <span>{{ value }}</span>
              </div>
            </td>
            <td class="no-wrap">
              <span v-if="value instanceof Object" class="color-d28750 pointer no-wrap" @click="detail(key)">查看</span>
              <span v-else class="color-d28750 pointer no-wrap" @click="modify(key,value)">修改</span>
              <span class="color-d28750 pointer m-l-10 no-wrap" @click="remove(key)">删除</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  props: {
    data: {
      type: Object,
      default: () => { }
    }
  },
  setup (props, { emit }) {
    const detail = (key) => {
      emit('detail', key)
    }
    const modify = (key, value) => {
      emit('modify', key, value)
    }
    const remove = (key) => {
      emit('remove', key)
    }
    const columns = ["key", "value", "操作"]
    return { columns, detail, modify, remove }
  }
};

export default ObjectComp