import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Sequelize } from 'sequelize';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from 'src/roles/roles.model';

import { Post } from './post.model';
import {FilesModule} from "../files/files.module";
import {User} from "../users/users.model";

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [
      SequelizeModule.forFeature([Role, Post, User]),
      FilesModule,
  ]
})
export class PostsModule {}
