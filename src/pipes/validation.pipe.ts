import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, metadata: ArgumentMetadata): Promise<any> {

        const { metatype, type } = metadata;

        // 🔥 1. Пропускаем всё, что НЕ body (файлы, params, query)
        if (type !== 'body') {
            return value;
        }

        // 🔥 2. Пропускаем примитивы и обычные объекты (multer файл = Object)
        const types: Function[] = [String, Boolean, Number, Array, Object];
        if (!metatype || types.includes(metatype)) {
            return value;
        }

        // 🔥 3. Если body пустой
        if (!value) {
            throw new ValidationException(['Body is empty']);
        }

        const obj = plainToClass(metatype, value);
        const errors = await validate(obj);

        if (errors.length) {
            console.log(errors);

            const messages = errors.map(err =>
                `${err.property} - ${Object.values(err.constraints || {}).join(', ')}`
            );

            throw new ValidationException(messages);
        }

        return value;
    }
}