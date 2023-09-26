const AbstractManager = require("./AbstractManager")

class ScoresManager extends AbstractManager {
  constructor() {
    super({ table: "scores" })
  }

  insert(score) {
    return this.database.query(
      `insert into ${this.table} (player, score) values (? , ?)`,
      ["Anonyme", score]
    )
  }

  findHighScores() {
    return this.database.query(
      `select * from  ${this.table} ORDER BY score DESC`
    )
  }

  // update(item) {
  //   return this.database.query(
  //     `update ${this.table} set title = ? where id = ?`,
  //     [item.title, item.id]
  //   )
  // }
}

module.exports = ScoresManager
