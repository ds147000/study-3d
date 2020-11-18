/**
 * 第二节 灯光与材质
 */
import * as THREE from 'three'
import { useCallback, useEffect, useRef } from 'react'
import './index.scss'

const Page = () => {
    const Body = useRef()
    const Scene = useRef(new THREE.Scene()).current // 场景
    const Camera = useRef(new THREE.PerspectiveCamera()).current // 透视相机
    const Render = useRef(new THREE.WebGLRenderer({ antialias: true })).current  // 渲染器
    const Meshs = useRef([]).current
    const Lights = useRef([]).current
    const id = useRef(null)

    /** 初始化灯光 */
    const createLight = useCallback(() => {
        // 太阳光
        // const dirLight = new THREE.DirectionalLight('#ffffff', 0.7)
        // dirLight.position.set(100, 200, 200)
        
        // 环境光
        const ambLight = new THREE.AmbientLight('#ffffff', 0.3)

        // 点光源
        const point = new THREE.PointLight('#ffffff', 2, 8)
        point.position.set(0, 5, 0)
        
        Scene.add(point, ambLight)
        Lights.push(point, ambLight)
    }, [])

    const createRect = useCallback(() => {
        const rect = new THREE.BoxBufferGeometry(2, 2, 2)
        const meshBasicMater = new THREE.MeshBasicMaterial({ color: 'red' })
        const mesh = new THREE.Mesh(rect, meshBasicMater)
        mesh.position.set(0, 0, 0)
        Scene.add(mesh)
        Meshs.push(mesh)
    }, [])

    /** 创建线条 */
    const createLine = useCallback(() => {
        const lineMater = new THREE.LineBasicMaterial({ vertexColors: true })
        const geomatry = new THREE.Geometry()
        for(let i = 0; i < 8000; i ++) {
            const x = Math.random() * 2 - 1
            const y = Math.random() * 2 - 1
            const z = Math.random() * 2 - 1
            geomatry.vertices.push(new THREE.Vector3(x, y, z))
            geomatry.colors.push(new THREE.Color(Math.random(), Math.random(), Math.random()))
        }

        const mesh = new THREE.Line(geomatry, lineMater)
        mesh.position.set(4, 0, 0)
        Scene.add(mesh)
        Meshs.push(mesh)
    }, [])

    /** 创建lambert材质立方体 */
    const createLambert = useCallback(() => {
        const lambert = new THREE.MeshLambertMaterial({ color: 'red' })
        const rect = new THREE.BoxBufferGeometry(2, 2, 2)
        const mesh = new THREE.Mesh(rect, lambert)
        mesh.position.set(-4, 0, 0)
        Scene.add(mesh)
        Meshs.push(mesh)
    }, [])

    /** 创建phong材质立方体 */
    const cratePhong = useCallback(() => {
        const phong = new THREE.MeshPhongMaterial({ color: 'red' })
        const rect = new THREE.BoxBufferGeometry(2, 2, 2)
        const mesh = new THREE.Mesh(rect, phong)
        mesh.position.set(-8, 0, 0)
        Scene.add(mesh)
        Meshs.push(mesh)
    }, [])

    const init = useCallback(() => {
        Render.setSize(Body.current.offsetWidth, Body.current.offsetHeight)
        // 设置相机参数
        Camera.aspect = Body.current.offsetWidth / Body.current.offsetHeight
        Camera.fov = 45
        Camera.near = 1
        Camera.far = 1000
        Camera.position.set(0, 3, 30)
        Camera.lookAt(0, 0, 0)
        Camera.updateProjectionMatrix()
    }, [Render, Body])

    // 渲染画面
    const renderScene = useCallback(() => {
        Render.render(Scene, Camera)
        Meshs.forEach(item => {
            item.rotation.x += 0.5 / 180 * Math.PI 
            item.rotation.y += 0.5 / 180 * Math.PI 
        })
        id.current = window.requestAnimationFrame(() => renderScene())
    }, [Render, Meshs])

    useEffect(() => {
        Body.current.append(Render.domElement)
        init()
        createLight()
        createRect()
        createLine()
        createLambert()
        cratePhong()
        renderScene()

        // 销毁钩子
        return () => {
            cancelAnimationFrame(id.current)
            Meshs.forEach(item => {
                Scene.remove(item)
                item.geometry.dispose()
                item.material.dispose()
            })
            Lights.forEach(item => Scene.remove(item))
            Render.dispose()
            Scene.dispose()
        }
    }, [])

    return (
        <div className="page" ref={Body} ></div>
    )
}

export default Page
