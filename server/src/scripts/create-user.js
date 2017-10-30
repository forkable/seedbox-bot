import inquirer from "inquirer";
import * as bcrypt from "bcrypt-nodejs";
import { User } from "../models/index";
import { sequelize } from "../databaseConnection";
import uuid from 'uuid/v1';
let prompt = inquirer.createPromptModule();

sequelize.sync()
  .then(async () => {
    prompt([
      {
        type: 'input', message: '请输入用户名', name: "username",
        validate: async function (input) {
          let done = this.async();
          if (!input) {
            done('用户名不能为空');
            return;
          }
          let user = await User.find({
            where: {
              username: input,
            },
          });
          if (user) {
            done('用户已经存在');
            return;
          }
          done(null, true);
        },
      },
      {
        type: 'password', message: '请输入密码', name: "password",
        validate: async function (input) {
          let done = this.async();
          if (!input) {
            done('密码不能为空');
            return;
          }
          done(null, true);
        },
      },
    ]).then(async (_) => {
      await User.create({
        username: _.username,
        password: bcrypt.hashSync(_.password),
      });
      console.log("用户创建成功");
    });
  });