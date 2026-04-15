import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import {InjectModel} from "@nestjs/sequelize";
import {Post} from "./post.model";
import { FilesService } from 'src/files/files.service';
import {User} from "../users/users.model";


@Injectable()
export class PostsService {

    constructor(@InjectModel(Post) private postRepository: typeof Post,
                @InjectModel(User) private userRepository: typeof User,
                private fileService: FilesService) {
    }



    async create(dto: CreatePostDto, image: any) {
        const user = await this.userRepository.findByPk(dto.userId);

        if (!user) {
            throw new Error('Пользователь не найден');
        }
        const fileName = await this.fileService.createFile(image)
        const post = await this.postRepository.create({...dto, image: fileName});
        return post;
    }
}
