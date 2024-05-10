const MyTable = {
  template: `<div class="vue3-table">
                <table>
                  <thead>
                    <tr>
                      <th v-for="(header, index) in columns" :key="index" style="text-align:center">{{ header.render?'操作':header }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rowIndex) in dataSource" :key="rowIndex">
                      <td v-for="(cell, cellIndex) in formatRow(row)" :key="cellIndex" style="text-align:center">
                        <div v-if="cell === true">
                          <a href="javascript:void(0)" @click="showRow(row)">查看</a>
                          <a href="javascript:void(0)" @click="showRow(row,true)" style="margin-left:10px">修改</a>
                          <a href="javascript:void(0)" @click="showRow(row,false,true)" style="margin-left:10px">删除</a>
                          </div>
                        <span v-else>{{cell}}</span>
                        </td>
                    </tr>
                  </tbody>
                </table>
              </div>`,
  // 组件的其他选项，如 data、methods 等
  props: {
    columns: {
      type: Array,
      required: true
    },
    dataSource: {
      type: Array,
      required: true
    }
  },
  setup (props, { emit }) {
    const formatRow = (row) => {
      // 根据columns定义格式化每一行的数据
      const dd = props.columns.map((column, index) => {
        if (column.render) return column.render
        return row[column] || '-';
      });
      return dd
    };

    const showRow = (row, isEdit, isDelete) => {
      emit('show-row', row, isEdit, isDelete)
    }

    return {
      formatRow,
      showRow
    };
  }
};

export default MyTable