import { Injectable, NotFoundException } from '@nestjs/common';
import { Blogs } from './models/Blogs';
import { Fotos } from 'src/domain/fotos/models/Fotos';
import { FotosService } from 'src/domain/fotos/fotos.service';
import { CreateBlogFotosDto } from 'src/domain/fotos/DTOs/fotos.dto';
import { CreateUpdateBlogDto, GetBlogDto, GetBlogListItemDto } from './DTOs/blogs.dto';

const BLOG_INCLUDE = [
    {
        model: Fotos,
        as: 'fotos',
        attributes: ['id', 'url'],
        where: { es_activo: 1 },
        required: false,
    },
];

@Injectable()
export class BlogsService {
    constructor(private readonly fotosService: FotosService) {}

    private mapBlog(blog: Blogs): GetBlogDto {
        return {
            id: blog.id,
            titulo: blog.titulo,
            cuerpo: blog.cuerpo,
            es_activo: blog.es_activo,
            created_at: blog.created_at ? new Date(blog.created_at).toISOString() : '',
            fotos: (blog.fotos ?? []).map(f => ({ id: f.id, url: f.url })),
        };
    }

    private mapBlogListItem(blog: Blogs): GetBlogListItemDto {
        const fotos = blog.fotos ?? [];
        return {
            id: blog.id,
            titulo: blog.titulo,
            es_activo: blog.es_activo,
            created_at: blog.created_at ? new Date(blog.created_at).toISOString() : '',
            portada_url: fotos.length > 0 ? fotos[0].url : null,
        };
    }

    async findAll(): Promise<GetBlogListItemDto[]> {
        const blogs = await Blogs.findAll({
            where: { es_activo: 1 },
            include: BLOG_INCLUDE,
            order: [['created_at', 'DESC']],
        });
        return blogs.map(b => this.mapBlogListItem(b));
    }

    async findAllForAdmin(): Promise<GetBlogListItemDto[]> {
        const blogs = await Blogs.findAll({
            include: BLOG_INCLUDE,
            order: [['created_at', 'DESC']],
        });
        return blogs.map(b => this.mapBlogListItem(b));
    }

    async findById(id: number): Promise<GetBlogDto> {
        const blog = await Blogs.findByPk(id, { include: BLOG_INCLUDE });
        if (!blog) throw new NotFoundException('Artículo no encontrado');
        return this.mapBlog(blog);
    }

    async create(dto: CreateUpdateBlogDto, fotoUrls: string[]): Promise<GetBlogDto> {
        const blog = await Blogs.create({
            titulo: dto.titulo,
            cuerpo: dto.cuerpo,
        });

        if (fotoUrls.length > 0) {
            const fotosDto: CreateBlogFotosDto[] = fotoUrls.map(url => ({
                url,
                id_blog: blog.id,
            }));
            await this.fotosService.bulkCreateForBlog(fotosDto);
        }

        return this.findById(blog.id);
    }

    async update(id: number, dto: CreateUpdateBlogDto, newFotoUrls?: string[]): Promise<GetBlogDto> {
        const blog = await Blogs.findByPk(id);
        if (!blog) throw new NotFoundException('Artículo no encontrado');

        await blog.update({
            titulo: dto.titulo,
            cuerpo: dto.cuerpo,
        });

        if (newFotoUrls && newFotoUrls.length > 0) {
            const fotosDto: CreateBlogFotosDto[] = newFotoUrls.map(url => ({
                url,
                id_blog: id,
            }));
            await this.fotosService.bulkCreateForBlog(fotosDto);
        }

        return this.findById(id);
    }

    async delete(id: number): Promise<void> {
        const blog = await Blogs.findByPk(id);
        if (!blog) throw new NotFoundException('Artículo no encontrado');
        await this.fotosService.deleteByBlogId(id);
        await blog.destroy();
    }

    async toggle(id: number): Promise<GetBlogDto> {
        const blog = await Blogs.findByPk(id);
        if (!blog) throw new NotFoundException('Artículo no encontrado');
        await blog.update({ es_activo: blog.es_activo ? 0 : 1 });
        return this.findById(id);
    }
}