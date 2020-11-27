/**
 * 第四节 阴影
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
    const IsDown = useRef(false)
    const PI = useRef(30)
    const R = useRef(90)
    const id = useRef(null)

    /** 初始化灯光 */
    const createLight = useCallback(() => {
        // 太阳光
        const dirLight = new THREE.DirectionalLight('#ffffff', 1.2)
        dirLight.position.set(0, 0, 3000)
        dirLight.castShadow = true
        dirLight.shadow.camera.top = -10
        dirLight.shadow.camera.bottom = 10
        dirLight.shadow.camera.right = -10
        dirLight.shadow.camera.left = 10
        dirLight.shadow.mapSize.width = 2000
        dirLight.shadow.mapSize.height = 2000
        // 环境光
        const ambLight = new THREE.AmbientLight('#ffffff', 0.6)

        // 点光源
        // const point = new THREE.PointLight('#ffffff', 2, 8)
        // point.position.set(0, 5, 0)
        
        Scene.add(dirLight, ambLight)
        Lights.push(dirLight, ambLight)
    }, [])

    /** 创建线条 */
    const createLine = useCallback((x, y, z, color, num) => {
        const lineMater = new THREE.LineBasicMaterial({ color })
        const geomatry = new THREE.Geometry()
        const width = Math.random() * 5
        for(let i = 0; i < 1000 + num; i ++) {
            const x = Math.random() * width - width * 0.5
            const y = Math.random() * width - width * 0.5
            const z = Math.random() * width - width * 0.5
            geomatry.vertices.push(new THREE.Vector3(x, y, z))
        }

        const mesh = new THREE.Line(geomatry, lineMater)
        mesh.castShadow = true
        mesh.position.set(x, y, z)
        Scene.add(mesh)
        Meshs.push(mesh)
    }, [])

    /** 创建lambert材质立方体 */
    const createLambert = useCallback((x, y, z, color) => {
        const width = Math.random() * 5
        const lambert = new THREE.MeshLambertMaterial({ color })
        const rect = new THREE.BoxBufferGeometry(width, width, width)
        const mesh = new THREE.Mesh(rect, lambert)
        mesh.position.set(x, y, z)
        mesh.castShadow = true
        mesh.receiveShadow = true
        Scene.add(mesh)
        Meshs.push(mesh)
    }, [])

    /** 创建phong材质立方体 */
    const cratePhong = useCallback((x, y, z, color) => {
        const width = Math.random() * 5
        const phong = new THREE.MeshPhongMaterial({ color })
        const rect = new THREE.BoxBufferGeometry(width, width, width)
        const mesh = new THREE.Mesh(rect, phong)
        mesh.position.set(x, y, z)
        mesh.castShadow = true
        mesh.receiveShadow = true
        Scene.add(mesh)
        Meshs.push(mesh)
    }, [])

    /** 创建星球 */
    const createStart = useCallback((x, y, z, color) => {
        const width = Math.random() * 2
        // 球体
        const geomatry = new THREE.SphereBufferGeometry(width, 64, 64)
        const phong = new THREE.MeshPhongMaterial({ color })
        const sphere = new THREE.Mesh(geomatry, phong)
        sphere.position.set(x, y, z)

        // 星云
        const geomatry2 = new THREE.RingGeometry(width + 0.3, width + 0.3 + width * 0.3, 64)
        const lambert = new THREE.MeshLambertMaterial({ color: '#fff', side: THREE.DoubleSide })
        const ring = new THREE.Mesh(geomatry2, lambert)
        ring.position.set(x, y, z)
        ring.rotation.x = -90 * 180 / Math.PI

        const group = new THREE.Group()
        group.add(sphere, ring)
        Scene.add(group)

    }, [])


    const down = useCallback(() => IsDown.current = true, [])
    const up = useCallback(() => IsDown.current = false, [])
    const move = useCallback((event) => {
        if (IsDown.current === false) return
        R.current -= event.movementX * 0.5
        const x = PI.current * Math.cos(R.current / 180 * Math.PI)
        const y = Camera.position.y + event.movementY * 0.1
        const z = PI.current * Math.sin(R.current / 180 * Math.PI)

        Camera.position.set(x, y, z)
        Camera.lookAt(0, 0, 0)
    }, [])

    const wheel = useCallback((event) => {
        if (event.deltaY > 0) PI.current += 1
        else PI.current -= 1

        const x = PI.current * Math.cos(R.current / 180 * Math.PI)
        const y = Camera.position.y
        const z = PI.current * Math.sin(R.current / 180 * Math.PI)

        Camera.position.set(x, y, z)
        Camera.lookAt(0, 0, 0)
    }, [])

    const init = useCallback(() => {
        Render.setSize(Body.current.offsetWidth, Body.current.offsetHeight)
        Render.shadowMap.enabled = true
        // 设置相机参数
        Camera.aspect = Body.current.offsetWidth / Body.current.offsetHeight
        Camera.fov = 45
        Camera.near = 1
        Camera.far = 1000
        Camera.position.set(0, 3, PI.current)
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

    // 点击事件
    const click = useCallback(() => {
        // const array = [createLambert, cratePhong, createLine]
        const index = Math.floor(Math.random() * 3)
        const x = 30 - Math.random() * 60
        const y = 5 - Math.random() * 10
        const z = 30 - Math.random() * 60
        const color  = new THREE.Color(Math.random(), Math.random(), Math.random())
        // const num = index === 2 ? Math.ceil(Math.random() * 10000) : 0
        // array[index](x, y, z, color, num)
        createStart(x, y, z, color)
    }, [])

    useEffect(() => {
        Body.current.append(Render.domElement)
        init()
        createLight()
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
        <div className="page" ref={Body} onMouseDown={down} onMouseUp={up} onMouseMove={move} onWheel={wheel} onClick={click} ></div>
    )
}

export default Page
